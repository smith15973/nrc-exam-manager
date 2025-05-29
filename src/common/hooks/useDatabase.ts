// useDatabase.ts 
import { useState, useEffect } from "react";


export const useDatabase = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [plantsWithExams, setPlantsWithExams] = useState<Plant[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getPlants = async () => {
        try {
            const result = await window.db.plants.get();
            if (result.success) {
                setPlants(result.plants || []);
            } else {
                setError(result.error || 'Failed to fetch plants');
            }
        } catch (err) {
            setError("Failed to fetch plants");
        }
    };

    const getPlantsWithExams = async () => {
        try {
            const result = await window.db.plants.getWithExams();
            if (result.success) {
                setPlantsWithExams(result.plants || [])
            } else {
                setError(result.error || 'Failed to fetch plants with exams');
            }
        } catch (err) {
            setError("Failed to fetch plants with exams");
        }
    };
    const getPlant = async (plantId: number) => {
        try {
            const result = await window.db.plants.getById(plantId);
            if (result.success) {
                return result.plant ?? null;
            } else {
                setError(result.error || 'Failed to fetch plant');
            }
        } catch (err) {
            setError("Failed to fetch plant");
        }
    };

    const getPlantWithExams = async (plantId: number) => {
        try {
            const result = await window.db.plants.getByIdWithExams(plantId);
            if (result.success) {
                return result.plant ?? null;
            } else {
                setError(result.error || 'Failed to fetch plants with exams');
            }
        } catch (err) {
            setError("Failed to fetch plants with exams");
        }
    };

    const addPlant = async (plant: Plant) => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.plants.add(plant);
            if (result.success) {
                setError(null);
                await getPlants();
                await getPlantsWithExams();
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
            const result = await window.db.plants.update(plant);
            if (result.success) {
                setError(null);
                await getPlants();
                await getPlantsWithExams();
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
            const result = await window.db.plants.delete(plantId);
            if (result.success) {
                await getPlants();
                await getPlantsWithExams();
            } else {
                setError(result.error || 'Failed to delete plant');
            }
        } catch (err) {
            setError("Failed to delete plant")
        }
    }

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

    const getExam = async (examId: number) => {
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
        getPlants();
        getExams();
        getPlantsWithExams();
        getQuestions();
    }, []);

    return {
        plants, getPlant, getPlantWithExams, plantsWithExams, addPlant, updatePlant, deletePlant,
        exams, getExam, addExam, updateExam, deleteExam, getExamsByQuestionId,
        addQuestion, getQuestionById, getQuestionComplete, questions, updateQuestion, deleteQuestion,
        getAnswersByQuestionId,
        error
    }
}