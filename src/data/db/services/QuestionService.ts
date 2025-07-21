// db/services/QuestionService.ts
import { QuestionRepository } from '../repositories/QuestionRepository';
import { ExamRepository } from '../repositories/ExamRepository';
import { SystemRepository } from '../repositories/SystemRepository';
import { KaRepository } from '../repositories/KaRepository';
import { SystemKaRepository } from '../repositories/SystemKaRepository';

export class QuestionService {
    constructor(
        private questionRepo: QuestionRepository,
        private examRepo: ExamRepository,
        private systemRepo: SystemRepository,
        private kaRepo: KaRepository,
        private systemKaRepo: SystemKaRepository,
    ) { }

    async getCompleteQuestion(questionId: number): Promise<Question> {
        // Get all data in parallel for better performance
        const [questionRow, exams, system_kas, examQuestions] = await Promise.all([
            this.questionRepo.getById(questionId),
            this.examRepo.getByQuestionId(questionId),
            this.systemKaRepo.getByQuestionId(questionId),
            this.questionRepo.getExamQuestions(questionId)
        ]);

        const question: Question = {
            question_id: questionRow.question_id,
            question_text: questionRow.question_text,
            img_url: questionRow.img_url,
            answer_a: questionRow.answer_a,
            answer_a_justification: questionRow.answer_a_justification,
            answer_b: questionRow.answer_b,
            answer_b_justification: questionRow.answer_b_justification,
            answer_c: questionRow.answer_c,
            answer_c_justification: questionRow.answer_c_justification,
            answer_d: questionRow.answer_d,
            answer_d_justification: questionRow.answer_d_justification,
            exam_level: questionRow.exam_level,
            correct_answer: questionRow.correct_answer,
            cognitive_level: questionRow.cognitive_level,
            technical_references: questionRow.technical_references,
            references_provided: questionRow.references_provided,
            objective: questionRow.objective,
            system_kas: system_kas,
            exams: exams,
            question_exams: examQuestions
        };

        return question;
    }

    // You can add more complex business logic methods here
    async getQuestionsComplete(filters?: QuestionFilters): Promise<Question[]> {
        const questions = await this.questionRepo.getMany(filters);

        // Get complete details for each question
        const completeQuestions = await Promise.all(
            questions.map(q => this.getCompleteQuestion(q.question_id))
        );

        return completeQuestions;

    }

    async getQuestionsByExam(examId: number): Promise<Question[]> {
        // This would require a new method in QuestionRepository
        // For now, this is a placeholder showing how services can coordinate

        const allQuestions = await this.getQuestionsComplete();
        return allQuestions.filter(q =>
            q.exams?.some(exam => exam.exam_id === examId)
        );

    }


    async getQuestionForExport(questionId: number): Promise<QuestionForDataTransfer> {
        // Get all data in parallel for better performance
        const [questionRow, system_kas, examQuestions] = await Promise.all([
            this.questionRepo.getById(questionId),
            this.systemKaRepo.getByQuestionId(questionId),
            this.questionRepo.getExamQuestions(questionId)
        ]);

        // Transform question_exams data
        const questionExams = examQuestions.map(qe => ({
            exam_name: qe.exam?.name || '',
            main_system: qe.main_system_ka_system || '',
            main_ka: qe.main_system_ka_ka || '',
            ka_match_justification: qe.ka_match_justification || '',
            sro_match_justification: qe.sro_match_justification || '',
            answers_order: qe.answers_order || '',
            question_number: qe.question_number || 0
        }));

        // Extract system_ka_numbers
        const systemKaNumbers = system_kas?.map(ska => ska.system_ka_number) || [];

        const question: QuestionForDataTransfer = {
            question_text: questionRow.question_text,
            img_url: questionRow.img_url,
            answer_a: questionRow.answer_a,
            answer_a_justification: questionRow.answer_a_justification,
            answer_b: questionRow.answer_b,
            answer_b_justification: questionRow.answer_b_justification,
            answer_c: questionRow.answer_c,
            answer_c_justification: questionRow.answer_c_justification,
            answer_d: questionRow.answer_d,
            answer_d_justification: questionRow.answer_d_justification,
            exam_level: questionRow.exam_level,
            correct_answer: questionRow.correct_answer,
            cognitive_level: questionRow.cognitive_level,
            technical_references: questionRow.technical_references,
            references_provided: questionRow.references_provided,
            objective: questionRow.objective,
            question_exams: questionExams,
            system_ka_numbers: systemKaNumbers
        };

        return question;
    }

}