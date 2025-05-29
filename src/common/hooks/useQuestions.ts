// useDatabase.ts 
import { useState, useEffect } from "react";


export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);


    // quesitons
    const addQuestion = async (question: Question) => {
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

    const getQuestions = async () => {
        try {
            const result = await window.db.questions.get();
            if (result.success) {
                setQuestions(result.questions || []);
            } else {
                setError(result.error || 'Failed to fetch questions');
            }
        } catch (err) {
            setError("Failed to fetch questions");
        }
    };
    const getQuestionsComplete = async () => {
        try {
            const result = await window.db.questions.getComplete();
            if (result.success) {
                setQuestions(result.questions || []);
            } else {
                setError(result.error || 'Failed to fetch questions');
            }
        } catch (err) {
            setError("Failed to fetch questions");
        }
    };

    const getQuestionById = async (questionId: number) => {
        try {
            const result = await window.db.questions.getById(questionId);
            if (result.success) {
                return result.question ?? null;
            } else {
                setError(result.error || `Failed to get question with id ${questionId}`);
            }
        } catch (err) {
            setError(`Failed to get question with id ${questionId}`);
        }
    };

    const getQuestionComplete = async (questionId: number) => {
        try {
            const result = await window.db.questions.getByIdComplete(questionId);
            if (result.success) {
                return result.question ?? null;
            } else {
                setError(result.error || 'Failed to fetch question');
            }
        } catch (err) {
            setError("Failed to fetch question");
        }
    };


    const updateQuestion = async (question: Question) => {
        if (!question.question_text) {
            setError('Please fill in all fields');
            return null;
        }
        try {
            const result = await window.db.questions.update(question);
            if (result.success) {
                setError(null);
                await getQuestions();
            } else {
                setError(result.error || 'Failed to update question');
                return null;
            }
        } catch (err) {
            setError("Failed to update question");
            return null;
        }
    };

    const deleteQuestion = async (questionId: number) => {
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

    const getAnswersByQuestionId = async (questionId: number) => {
        try {
            const result = await window.db.questions.getAnswersByQuestionId(questionId);
            if (result.success) {
                return result.answers;
            } else {
                setError(result.error || `Failed to get answers by questionId: ${questionId}`);
            }
        } catch (err) {
            setError(`Failed to get answers by questionId: ${questionId}`);
        }
    };



    useEffect(() => {
        getQuestions();
    }, []);

    return {
        addQuestion, getQuestionById, getQuestionComplete, questions, updateQuestion, deleteQuestion,
        getAnswersByQuestionId,
        error, getQuestionsComplete
    }
}