import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { CircularProgress, Typography, Alert } from '@mui/material';
import { defaultPlant } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import PlantForm from '../components/PlantForm';
import ExamsList from '../../exams/components/ExamsList';
import ExamForm from '../../exams/components/ExamForm';


export default function PlantPage() {
    const [plant, setPlant] = useState(defaultPlant);
    const { plantId } = useParams<{ plantId: string }>();
    const { getPlantWithExams, updatePlant } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { deleteExam, addExam } = useDatabase();


    // Single source of truth for loading exam data
    const loadPlant = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPlant = await getPlantWithExams(id);
            if (fetchedPlant) {
                setPlant(fetchedPlant);
            } else {
                setError('Plant not found');
            }
        } catch (err) {
            setError('Failed to load plant');
            console.error('Failed to load plant:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (plantId) {
            loadPlant(parseInt(plantId));
        }
    }, []);

    const handleSubmit = async (updatedPlant: Plant) => {
        try {
            setLoading(true);
            setError(null);
            await updatePlant(updatedPlant);
            if (updatedPlant.plant_id) {
                loadPlant(updatedPlant.plant_id)
            }
        } catch (err) {
            setError('Failed to update plant');
            console.error("Failed to update plant:", err);
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteExam = async (examId: number) => {
        try {
            setError(null);
            await deleteExam(examId)
            if (examId) {
                loadPlant(plant.plant_id)
            }
        } catch (err) {
            setError('Failed to delete exam');
            console.error("Failed to delete exam:", err);
        }
    }

    const handleSubmitExam = async (newExam: Exam) => {
        try {
            setLoading(true);
            setError(null);

            // Update the exam
            await addExam(newExam);

            // Explicitly refetch to get the updated data with fresh plant info
            if (newExam) {
                await loadPlant(plant.plant_id);
            }
        } catch (err) {
            setError('Failed to add exam');
            console.error("Failed to add exam:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && plant.plant_id === undefined) {
        // Initial loading state
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <Typography variant='h4'>Hello {plant.name}</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <PlantForm plant={plant} handleSubmit={handleSubmit} sx={{ pb: 2 }} />

            {loading && plant.plant_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating exam...
                </Alert>
            )}

            <ExamForm plant={plant} handleSubmit={handleSubmitExam} />
            <ExamsList exams={plant.exams || []} deleteExam={handleDeleteExam} />


        </>
    )
};