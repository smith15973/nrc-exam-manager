// useDatabase.ts 
import { useState, useEffect } from "react";


export const useExams = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addExam = async (exam: Exam): Promise<void> => {
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


    const getExams = async (): Promise<Exam[]> => {
        try {
            const result = await window.db.exams.get();
            if (result.success) {
                setExams(result.exams || []);
                return result.exams || [];
            } else {
                setError(result.error || 'Failed to fetch exams');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch exams");
            return [];
        }
    };

    const getExamById = async (examId: number): Promise<Exam | null> => {
        try {
            const result = await window.db.exams.getById(examId);
            if (result.success) {
                return result.exam || null;
            } else {
                setError(result.error || 'Failed to fetch exam');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch exam");
            return null;
        }
    };

    const getExamsByQuestionId = async (questionId: number): Promise<Exam[]> => {
        try {
            const result = await window.db.exams.getByQuestionId(questionId);
            if (result.success) {
                return result.exams || [];
            } else {
                setError(result.error || `Failed to get exams with questionId ${questionId}`);
                return [];
            }
        } catch (err) {
            setError(`Failed to get exams with questionId ${questionId}`);
            return [];
        }
    };

    const updateExam = async (exam: Exam): Promise<void> => {
        if (!exam.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.exams.update(exam);
            if (result.success) {
                setError(null);
                await getExams();
            } else {
                setError(result.error || 'Failed to update exam');
                return;
            }
        } catch (err) {
            setError("Failed to update exam");
            return;
        }
    };

    const deleteExam = async (examId: number): Promise<void> => {
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


    const removeQuestionFromExam = async (examId: number, questionId: number): Promise<void> => {
        console.log(examId)
        try {
            const result = await window.db.exams.removeQuestion(examId, questionId)
            console.log(result)
            if (result.success) {
                return
            } else {
                setError(result.error || 'Failed to remove questions');
            }
        } catch (err) {
            setError('Failed to remove questions')
        }
    }


    useEffect(() => {
        getExams();
    }, []);

    return {
        exams, getExams, addExam, updateExam, deleteExam, getExamsByQuestionId, getExamById, error, removeQuestionFromExam
    }
}