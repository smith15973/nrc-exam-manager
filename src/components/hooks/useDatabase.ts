// useDatabase.ts 
import { useState, useEffect } from "react";


export const useDatabase = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPlants = async () => {
        try {
            const result = await window.api.getPlants();
            if (result.success) {
                setPlants(result.plants || []);
            } else {
                setError(result.error || 'Failed to fetch plants');
            }
        } catch (err) {
            setError("Failed to fetch plants");
        }
    };
    const fetchPlant = async (plantId: number) => {
        try {
            const result = await window.api.getPlant(plantId);
            if (result.success) {
                return result.plant ?? null;
            } else {
                setError(result.error || 'Failed to fetch plant');
            }
        } catch (err) {
            setError("Failed to fetch plant");
        }
    };

    const addPlant = async (plant: Plant) => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.api.addPlant(plant);
            if (result.success) {
                setError(null);
                await fetchPlants();
            } else {
                setError(result.error || 'Failed to add plant');
            }
        }
        catch (err) {
            setError("Failed to add plant");
        }
    };

    const updatePlant = async (plant: Plant) => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return null;
        }
        try {
            const result = await window.api.updatePlant(plant);
            if (result.success) {
                setError(null);
                await fetchPlants();
                return result.plant ?? plant;
            } else {
                setError(result.error || 'Failed to update plant');
                return null;
            }
        } catch (err) {
            setError("Failed to update plant");
            return null;
        }
    };

    const deletePlant = async (plantId: number) => {
        try {
            const result = await window.api.deletePlant(plantId);
            if (result.success) {
                await fetchPlants();
            } else {
                setError(result.error || 'Failed to delete plant');
            }
        } catch (err) {
            setError("Failed to delete plant")
        }
    }

    const fetchExams = async () => {
        try {
            const result = await window.api.getExams();
            if (result.success) {
                setExams(result.exams || []);
            } else {
                setError(result.error || 'Failed to fetch exams');
            }
        } catch (err) {
            setError("Failed to fetch exams");
        }
    };

    const fetchExam = async (examId: number) => {
        try {
            const result = await window.api.getExam(examId);
            if (result.success) {
                return result.exam ?? null;
            } else {
                setError(result.error || 'Failed to fetch exam');
            }
        } catch (err) {
            setError("Failed to fetch exam");
        }
    };

    const addExam = async (exam: Exam) => {
        if (!exam.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.api.addExam(exam);
            if (result.success) {
                setError(null);
                await fetchExams();
            } else {
                setError(result.error || 'Failed to add exam');
            }
        }
        catch (err) {
            setError("Failed to add exam");
        }
    };

    const updateExam = async (exam: Exam) => {
        if (!exam.name) {
            setError('Please fill in all fields');
            return null;
        }
        try {
            const result = await window.api.updateExam(exam);
            if (result.success) {
                setError(null);
                await fetchExams();
                return result.exam ?? exam;
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
            const result = await window.api.deleteExam(examId);
            if (result.success) {
                await fetchExams();
            } else {
                setError(result.error || 'Failed to delete exam');
            }
        } catch (err) {
            setError("Failed to delete exam")
        }
    }

    useEffect(() => {
        fetchPlants();
        fetchExams();
    }, []);

    return { plants, fetchPlant, addPlant, updatePlant, deletePlant, 
        exams, fetchExam, addExam, updateExam, deleteExam, 
        error }
}