// useDatabase.ts 
import { useState, useEffect } from "react";


export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);


    // quesitons
    const addQuestion = async (question: Question): Promise<void> => {
        if (!question.question_text) {
            setError('Please fill in quesiton text');
            return;
        }

        try {
            const result = await window.db.questions.add(question);
            if (result.success) {
                setError(null);
                await getQuestions();
            } else {
                setError(result.error || 'Failed to add question');
            }
        }
        catch (err) {
            setError("Failed to add question");
        }
    };

    const getQuestions = async (): Promise<Question[]> => {
        try {
            const result = await window.db.questions.get();
            if (result.success) {
                setQuestions(result.questions || []);
                return result.questions || [];
            } else {
                setError(result.error || 'Failed to fetch questions');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch questions");
            return [];
        }
    };

    const getQuestionsComplete = async (): Promise<Question[]> => {
        try {
            const result = await window.db.questions.getComplete();
            if (result.success) {
                setQuestions(result.questions || []);
                return result.questions || [];
            } else {
                setError(result.error || 'Failed to fetch questions');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch questions");
            return [];
        }
    };

    const getQuestionById = async (questionId: number): Promise<Question | null> => {
        try {
            const result = await window.db.questions.getById(questionId);
            if (result.success) {
                return result.question || null;
            } else {
                setError(result.error || `Failed to get question with id ${questionId}`);
                return null;
            }
        } catch (err) {
            setError(`Failed to get question with id ${questionId}`);
            return null;
        }
    };

    const getQuestionComplete = async (questionId: number): Promise<Question | null> => {
        try {
            const result = await window.db.questions.getByIdComplete(questionId);
            if (result.success) {
                return result.question || null;

            } else {
                setError(result.error || 'Failed to fetch question');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch question");
            return null;
        }
    };

    const getQuestionsByExamId = async (examId: number): Promise<Question[]> => {
        try {
            const result = await window.db.questions.getByExamId(examId);
            if (result.success) {
                return result.questions || [];
            } else {
                setError(result.error || 'Failed to fetch question');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch question");
            return [];
        }
    };


    const updateQuestion = async (question: Question): Promise<void> => {
        if (!question.question_text) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.questions.update(question);
            if (result.success) {
                setError(null);
                await getQuestions();
            } else {
                setError(result.error || 'Failed to update question');
                return;
            }
        } catch (err) {
            setError("Failed to update question");
            return;
        }
    };

    const deleteQuestion = async (questionId: number): Promise<void> => {
        try {
            const result = await window.db.questions.delete(questionId);
            if (result.success) {
                await getQuestions();
            } else {
                setError(result.error || 'Failed to delete question');
            }
        } catch (err) {
            setError("Failed to delete question")
        }
    }

    const getAnswersByQuestionId = async (questionId: number): Promise<Answer[]> => {
        try {
            const result = await window.db.questions.getAnswersByQuestionId(questionId);
            if (result.success) {
                return result.answers || [];
            } else {
                setError(result.error || `Failed to get answers by questionId: ${questionId}`);
                return [];
            }
        } catch (err) {
            setError(`Failed to get answers by questionId: ${questionId}`);
            return [];
        }
    };



    useEffect(() => {
        getQuestions();
    }, []);

    return {
        addQuestion, getQuestionById, getQuestionComplete, questions, updateQuestion, deleteQuestion,
        getAnswersByQuestionId, getQuestionsByExamId,
        error, getQuestionsComplete
    }
}