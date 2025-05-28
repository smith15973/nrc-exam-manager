// db/services/QuestionService.ts
import { QuestionRepository } from '../repositories/QuestionRepository';
import { ExamRepository } from '../repositories/ExamRepository';

export class QuestionService {
    constructor(
        private questionRepo: QuestionRepository,
        private examRepo: ExamRepository
    ) {}

    async getCompleteQuestion(questionId: number): Promise<Question> {
        try {
            // Get all data in parallel for better performance
            const [questionRow, answers, exams] = await Promise.all([
                this.questionRepo.getById(questionId),
                this.questionRepo.getAnswersByQuestionId(questionId),
                this.examRepo.getByQuestionId(questionId)
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
                exams: exams,
            };

            return question;
        } catch (error) {
            throw error;
        }
    }

    // You can add more complex business logic methods here
    async getQuestionsWithFullDetails(): Promise<Question[]> {
        try {
            const questions = await this.questionRepo.getAll();
            
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
            const allQuestions = await this.getQuestionsWithFullDetails();
            return allQuestions.filter(q => 
                q.exams?.some(exam => exam.exam_id === examId)
            );
        } catch (error) {
            throw error;
        }
    }
}