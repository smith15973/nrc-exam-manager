import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useExams = () => {
    const [exams, setExams] = useState<Exam[]>([]);

    const addExam = async (exam: Exam): Promise<void> => {
        if (!exam.name) {
            toast.error("Please fill in exam name");
            return;
        }
        if (!exam.plant_id) {
            toast.error("Please fill in the exam plant_id");
            return;
        }
        try {
            const result = await window.db.exams.add(exam);
            if (result.success) {
                await getExams();
                toast.success("Exam added");
            } else {
                toast.error(result.error || "Failed to add exam");
            }
        } catch {
            toast.error("Failed to add exam");
        }
    };

    const getExamsByParams = async (params?: DBSearchParams): Promise<Exam[]> => {
        try {
            const result = await window.db.exams.getMany(params);
            if (result.success) {
                setExams(result.exams || []);
                return result.exams || [];
            } else {
                toast.error(result.error || "Failed to fetch exams");
                return [];
            }
        } catch {
            toast.error("Failed to fetch exams");
            return [];
        }
    };

    const getExamByParams = async (params: DBSearchParams): Promise<Exam | null> => {
        try {
            const result = await window.db.exams.get(params);
            if (result.success) {
                return result.exam || null;
            } else {
                toast.error(result.error || "Failed to fetch exam");
                return null;
            }
        } catch {
            toast.error("Failed to fetch exam");
            return null;
        }
    };

    const getExams = async (): Promise<Exam[]> => {
        try {
            const result = await window.db.exams.getAll();
            if (result.success) {
                setExams(result.exams || []);
                return result.exams || [];
            } else {
                toast.error(result.error || "Failed to fetch exams");
                return [];
            }
        } catch {
            toast.error("Failed to fetch exams");
            return [];
        }
    };

    const getExamById = async (examId: number): Promise<Exam | null> => {
        try {
            const result = await window.db.exams.getById(examId);
            if (result.success) {
                return result.exam || null;
            } else {
                toast.error(result.error || "Failed to fetch exam");
                return null;
            }
        } catch {
            toast.error("Failed to fetch exam");
            return null;
        }
    };

    const getExamsByName = async (name: string): Promise<Exam[]> => {
        return getExamsByParams({ name });
    };

    const getExamsByPlantId = async (plantId: number): Promise<Exam[]> => {
        return getExamsByParams({ plant_id: plantId });
    };

    const getExamByName = async (name: string): Promise<Exam | null> => {
        return getExamByParams({ name });
    };

    const getExamsByQuestionId = async (questionId: number): Promise<Exam[]> => {
        try {
            const result = await window.db.exams.getByQuestionId(questionId);
            if (result.success) {
                return result.exams || [];
            } else {
                toast.error(result.error || `Failed to get exams with questionId ${questionId}`);
                return [];
            }
        } catch {
            toast.error(`Failed to get exams with questionId ${questionId}`);
            return [];
        }
    };

    const updateExam = async (exam: Exam): Promise<void> => {
        if (!exam.name) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            const result = await window.db.exams.update(exam);
            if (result.success) {
                await getExams();
                toast.success("Exam updated");
            } else {
                toast.error(result.error || "Failed to update exam");
            }
        } catch {
            toast.error("Failed to update exam");
        }
    };

    const deleteExam = async (examId: number): Promise<void> => {
        try {
            const result = await window.db.exams.delete(examId);
            if (result.success) {
                await getExams();
                toast.success("Exam deleted");
            } else {
                toast.error(result.error || "Failed to delete exam");
            }
        } catch {
            toast.error("Failed to delete exam");
        }
    };

    const removeQuestionFromExam = async (examId: number, questionId: number): Promise<void> => {
        try {
            const result = await window.db.exams.removeQuestion(examId, questionId);
            if (!result.success) {
                toast.error(result.error || "Failed to remove questions");
            }
        } catch {
            toast.error("Failed to remove questions");
        }
    };

    const addExamQuestion = async (examId: number, questionId: number): Promise<void> => {
        try {
            const result = await window.db.exams.addQuestionToExam(examId, questionId);
            if (!result.success) {
                toast.error(result.error || "Failed to add exam question");
            }
        } catch {
            toast.error("Failed to add exam question");
        }
    };

    useEffect(() => {
        getExams();
    }, []);

    return {
        exams,
        getExamsByParams,
        getExamByParams,
        getExamsByName,
        getExamsByPlantId,
        getExamByName,
        getExams,
        getExamById,
        getExamsByQuestionId,
        addExam,
        updateExam,
        deleteExam,
        removeQuestionFromExam,
        addExamQuestion,
    };
};
