// useDatabase.ts
import { useState, useEffect } from "react";

export const useExamQuestions = () => {
    const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addExamQuestion = async (examQuestion: ExamQuestion): Promise<void> => {
        console.log(examQuestion);

        if (!examQuestion.exam_id) {
            setError('Please provide exam ID');
            return;
        }
        if (!examQuestion.question_id) {
            setError('Please provide question ID');
            return;
        }
        if (!examQuestion.question_number) {
            setError('Please provide question number');
            return;
        }

        try {
            const result = await window.db.exam_questions.add(examQuestion);
            if (result.success) {
                setError(null);
                await getExamQuestions();
            } else {
                setError(result.error || 'Failed to add exam question');
            }
        } catch (err) {
            setError("Failed to add exam question");
        }
    };

    const getExamQuestion = async (params?: DBSearchParams): Promise<ExamQuestion | null> => {
        try {
            const result = await window.db.exam_questions.get(params);
            if (result.success) {
                return result.examQuestion || null;
            } else {
                setError(result.error || 'Failed to fetch exam question');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch exam question");
            return null;
        }
    };

    const getExamQuestions = async (params?: DBSearchParams): Promise<ExamQuestion[]> => {
        try {
            const result = await window.db.exam_questions.getMany(params);
            console.log(result);

            if (result.success) {
                setExamQuestions(result.examQuestions || []);
                return result.examQuestions || [];
            } else {
                setError(result.error || 'Failed to fetch exam questions');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch exam questions");
            return [];
        }
    };

    const getExamQuestionsWithDetails = async (params?: DBSearchParams): Promise<ExamQuestion[]> => {
        try {
            const result = await window.db.exam_questions.getWithDetails(params);
            
            if (result.success) {
                setExamQuestions(result.examQuestions || []);
                return result.examQuestions || [];
            } else {
                setError(result.error || 'Failed to fetch exam questions with details');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch exam questions with details");
            return [];
        }
    };

    const getExamQuestionWithDetails = async (params?: DBSearchParams): Promise<ExamQuestion | null> => {
        try {
            const result = await window.db.exam_questions.getWithDetails(params);

            if (result.success && result.examQuestions && result.examQuestions.length > 0) {
                return result.examQuestions[0];
            } else if (result.success) {
                return null;
            } else {
                setError(result.error || 'Failed to fetch exam question with details');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch exam question with details");
            return null;
        }
    };

    const getExamQuestionsByExamId = async (examId: number): Promise<ExamQuestion[]> => {
        try {
            const result = await window.db.exam_questions.getByExamId(examId);
            console.log(result);

            if (result.success) {
                setExamQuestions(result.examQuestions || []);
                return result.examQuestions || [];
            } else {
                setError(result.error || 'Failed to fetch exam questions by exam ID');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch exam questions by exam ID");
            return [];
        }
    };

    const getExamQuestionsByQuestionId = async (questionId: number): Promise<ExamQuestion[]> => {
        try {
            const result = await window.db.exam_questions.getByQuestionId(questionId);
            console.log(result);

            if (result.success) {
                setExamQuestions(result.examQuestions || []);
                return result.examQuestions || [];
            } else {
                setError(result.error || 'Failed to fetch exam questions by question ID');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch exam questions by question ID");
            return [];
        }
    };

    const updateExamQuestion = async (examQuestion: ExamQuestion): Promise<void> => {
        if (!examQuestion.exam_id) {
            setError('Please provide exam ID');
            return;
        }
        if (!examQuestion.question_id) {
            setError('Please provide question ID');
            return;
        }
        if (!examQuestion.question_number) {
            setError('Please provide question number');
            return;
        }

        try {
            const result = await window.db.exam_questions.update(examQuestion);
            if (result.success) {
                setError(null);
                await getExamQuestions();
                return;
            } else {
                setError(result.error || 'Failed to update exam question');
                return;
            }
        } catch (err) {
            setError("Failed to update exam question");
            return;
        }
    };

    const deleteExamQuestion = async (data: {examId: number, questionId: number}): Promise<void> => {
        try {
            const result = await window.db.exam_questions.delete(data.examId, data.questionId);
            if (result.success) {
                setError(null);
                await getExamQuestions();
            } else {
                setError(result.error || 'Failed to delete exam question');
            }
        } catch (err) {
            setError("Failed to delete exam question");
        }
    };

    useEffect(() => {
        getExamQuestions();
    }, []);

    return {
        examQuestions,
        getExamQuestion,
        getExamQuestions,
        getExamQuestionWithDetails,
        getExamQuestionsWithDetails,
        getExamQuestionsByExamId,
        getExamQuestionsByQuestionId,
        addExamQuestion,
        updateExamQuestion,
        deleteExamQuestion,
        error
    };
};