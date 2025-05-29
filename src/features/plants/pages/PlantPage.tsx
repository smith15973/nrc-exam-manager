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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { plants, exams, data } = useDatabase();


    const loadPlantById = async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            const result = await data({ entity: 'plants', action: 'read', data: id })
            if (result.success) {
                setPlant(result.data);
            } else {
                setError(result.error || 'Failed to load plant');
            }
        } catch (err) {
            setError('Error loading plant');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (plantId) {
            loadPlantById(parseInt(plantId));
        }
    }, []);

    const handleSubmit = async (updatedPlant: Plant) => {
        try {
            setLoading(true);
            setError(null);
            const result = await data({ entity: 'plants', action: 'update', data: updatedPlant })
            if (result.success) {
                loadPlantById(updatedPlant.plant_id)
            } else {
                setError(result.error || 'Failed to load plant');
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
            const result = await data({ entity: 'exams', action: 'delete', data: examId })
            if (result.success) {
                loadPlantById(plant.plant_id)
            } else {
                setError(result.error || 'Failed to load plant');
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
            await exams.create(newExam);
            const result = await data({ entity: 'exams', action: 'create', data: newExam })

            // Explicitly refetch to get the updated data with fresh plant info
            if (newExam) {
                await loadPlantById(plant.plant_id);
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