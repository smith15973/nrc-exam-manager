import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);

    const addQuestion = async (question: Question): Promise<void> => {
        if (!question.question_text) {
            toast.error("Please fill in question text");
            return;
        }

        try {
            const result = await window.db.questions.add(question);
            if (result.success) {
                await getQuestions();
                toast.success("Question added");
            } else {
                toast.error(result.error || "Failed to add question");
            }
        } catch {
            toast.error("Failed to add question");
        }
    };

    type AddQuestionsBatchResult = {
        success: boolean;
        inserted: number[];
        ignored: number[];
    };

    const addQuestionsBatch = async (
        questions: Question[]
    ): Promise<AddQuestionsBatchResult> => {
        try {
            const result = await window.db.questions.addBatch(questions);

            if (result.success) {
                await getQuestions();
                toast.success(
                    `Batch added. Inserted: ${result.inserted?.length || 0}, Ignored: ${result.ignored?.length || 0}`
                );
                return {
                    success: true,
                    inserted: result.inserted || [],
                    ignored: result.ignored || [],
                };
            } else {
                toast.error(`Failed to add batch. Ignored: ${result.ignored?.join(", ")}`);
                return {
                    success: false,
                    inserted: result.inserted || [],
                    ignored: result.ignored || [],
                };
            }
        } catch {
            toast.error("Failed to add batch of questions");
            return { success: false, inserted: [], ignored: [] };
        }
    };

    const getQuestions = async (): Promise<Question[]> => {
        try {
            const result = await window.db.questions.get();
            if (result.success) {
                setQuestions(result.questions || []);
                return result.questions || [];
            } else {
                toast.error(result.error || "Failed to fetch questions");
                return [];
            }
        } catch {
            toast.error("Failed to fetch questions");
            return [];
        }
    };

    const getQuestionsComplete = async (
        filters?: QuestionFilters
    ): Promise<Question[]> => {
        try {
            const result = await window.db.questions.getComplete(filters);
            if (result.success) {
                setQuestions(result.questions || []);
                return result.questions || [];
            } else {
                toast.error(result.error || "Failed to fetch questions");
                return [];
            }
        } catch {
            toast.error("Failed to fetch questions");
            return [];
        }
    };

    const getQuestionById = async (questionId: number): Promise<Question | null> => {
        try {
            const result = await window.db.questions.getById(questionId);
            if (result.success) {
                return result.question || null;
            } else {
                toast.error(result.error || `Failed to get question with ID ${questionId}`);
                return null;
            }
        } catch {
            toast.error(`Failed to get question with ID ${questionId}`);
            return null;
        }
    };

    const getQuestionComplete = async (questionId: number): Promise<Question | null> => {
        try {
            const result = await window.db.questions.getByIdComplete(questionId);
            if (result.success) {
                return result.question || null;
            } else {
                toast.error(result.error || "Failed to fetch question");
                return null;
            }
        } catch {
            toast.error("Failed to fetch question");
            return null;
        }
    };

    const getQuestionsByExamId = async (examId: number): Promise<Question[]> => {
        try {
            const result = await window.db.questions.getByExamId(examId);
            if (result.success) {
                return result.questions || [];
            } else {
                toast.error(result.error || "Failed to fetch questions by exam ID");
                return [];
            }
        } catch {
            toast.error("Failed to fetch questions by exam ID");
            return [];
        }
    };

    const updateQuestion = async (question: Question): Promise<void> => {
        if (!question.question_text) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const result = await window.db.questions.update(question);
            if (result.success) {
                await getQuestions();
                toast.success("Question updated");
            } else {
                toast.error(result.error || "Failed to update question");
            }
        } catch {
            toast.error("Failed to update question");
        }
    };

    const deleteQuestion = async (questionId: number): Promise<void> => {
        try {
            const result = await window.db.questions.delete(questionId);
            if (result.success) {
                await getQuestions();
                toast.success("Question deleted");
            } else {
                toast.error(result.error || "Failed to delete question");
            }
        } catch {
            toast.error("Failed to delete question");
        }
    };

    const getAnswersByQuestionId = async (
        questionId: number
    ): Promise<Answer[]> => {
        try {
            const result = await window.db.questions.getAnswersByQuestionId(questionId);
            if (result.success) {
                return result.answers || [];
            } else {
                toast.error(result.error || `Failed to get answers by question ID: ${questionId}`);
                return [];
            }
        } catch {
            toast.error(`Failed to get answers by question ID: ${questionId}`);
            return [];
        }
    };

    useEffect(() => {
        getQuestions();
    }, []);

    return {
        questions,
        addQuestion,
        addQuestionsBatch,
        getQuestions,
        getQuestionsComplete,
        getQuestionById,
        getQuestionComplete,
        getQuestionsByExamId,
        getAnswersByQuestionId,
        updateQuestion,
        deleteQuestion,
    };
};
