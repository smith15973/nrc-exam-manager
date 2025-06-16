// db/services/QuestionService.ts
import { QuestionRepository } from '../repositories/QuestionRepository';
import { ExamRepository } from '../repositories/ExamRepository';
import { SystemRepository } from '../repositories/SystemRepository';
import { KaRepository } from '../repositories/KaRepository';

export class QuestionService {
    constructor(
        private questionRepo: QuestionRepository,
        private examRepo: ExamRepository,
        private systemRepo: SystemRepository,
        private kaRepo: KaRepository,
    ) { }

    async getCompleteQuestion(questionId: number): Promise<Question> {
        try {
            // Get all data in parallel for better performance
            const [questionRow, answers, exams, kas, systems] = await Promise.all([
                this.questionRepo.getById(questionId),
                this.questionRepo.getAnswersByQuestionId(questionId),
                this.examRepo.getByQuestionId(questionId),
                this.kaRepo.getByQuestionId(questionId),
                this.systemRepo.getByQuestionId(questionId),
            ]);

            const question: Question = {
                question_id: questionRow.question_id,
                question_text: questionRow.question_text,
                category: questionRow.category,
                exam_level: questionRow.exam_level,
                technical_references: questionRow.technical_references,
                difficulty_level: questionRow.difficulty_level,
                cognitive_level: questionRow.cognitive_level,
                objective: questionRow.objective,
                last_used: questionRow.last_used,
                answers: answers as [Answer, Answer, Answer, Answer],
                kas: kas,
                systems: systems,
                exams: exams,
            };

            return question;
        } catch (error) {
            throw error;
        }
    }

    // You can add more complex business logic methods here
    async getQuestionsComplete(filters?: QuestionFilters): Promise<Question[]> {
        try {
            console.log("QUESTION SERVICE", filters)
            const questions = await this.questionRepo.getMany(filters);

            // Get complete details for each question
            const completeQuestions = await Promise.all(
                questions.map(q => this.getCompleteQuestion(q.question_id!))
            );

            return completeQuestions;
        } catch (error) {
            throw error;
        }
    }

    async getQuestionsByExam(examId: number): Promise<Question[]> {
        // This would require a new method in QuestionRepository
        // For now, this is a placeholder showing how services can coordinate
        try {
            const allQuestions = await this.getQuestionsComplete();
            return allQuestions.filter(q =>
                q.exams?.some(exam => exam.exam_id === examId)
            );
        } catch (error) {
            throw error;
        }
    }
}