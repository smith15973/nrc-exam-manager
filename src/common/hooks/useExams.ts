// useDatabase.ts 
import { useState, useEffect } from "react";


export const useExams = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addExam = async (exam: Exam) => {
        if (!exam.name) {
            setError('Please fill in exam name');
            return;
        }
        if (!exam.plant_id) {
            setError('Please fill in the exam plant_id');
            return;
        }
        try {
            const result = await window.db.exams.add(exam);
            if (result.success) {
                setError(null);
                await getExams();
            } else {
                setError(result.error || 'Failed to add exam');
            }
        }
        catch (err) {
            setError("Failed to add exam");
        }
    };


    const getExams = async () => {
        try {
            const result = await window.db.exams.get();
            if (result.success) {
                setExams(result.exams || []);
            } else {
                setError(result.error || 'Failed to fetch exams');
            }
        } catch (err) {
            setError("Failed to fetch exams");
        }
    };

    const getExamById = async (examId: number) => {
        try {
            const result = await window.db.exams.getById(examId);
            if (result.success) {
                return result.exam ?? null;
            } else {
                setError(result.error || 'Failed to fetch exam');
            }
        } catch (err) {
            setError("Failed to fetch exam");
        }
    };

    const getExamsByQuestionId = async (questionId: number) => {
        try {
            const result = await window.db.exams.getByQuestionId(questionId);
            if (result.success) {
                return result.exams;
            } else {
                setError(result.error || `Failed to get exams with questionId ${questionId}`);
            }
        } catch (err) {
            setError(`Failed to get exams with questionId ${questionId}`);
        }
    };

    const updateExam = async (exam: Exam) => {
        if (!exam.name) {
            setError('Please fill in all fields');
            return null;
        }
        try {
            const result = await window.db.exams.update(exam);
            if (result.success) {
                setError(null);
                await getExams();
            } else {
                setError(result.error || 'Failed to update exam');
                return null;
            }
        } catch (err) {
            setError("Failed to update exam");
            return null;
        }
    };

    const deleteExam = async (examId: number) => {
        try {
            const result = await window.db.exams.delete(examId);
            if (result.success) {
                await getExams();
            } else {
                setError(result.error || 'Failed to delete exam');
            }
        } catch (err) {
            setError("Failed to delete exam")
        }
    }


    useEffect(() => {
        getExams();
    }, []);

    return {
        exams, getExams, addExam, updateExam, deleteExam, getExamsByQuestionId, getExamById, error
    }
}