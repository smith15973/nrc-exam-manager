import { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { CircularProgress, Typography, Alert } from '@mui/material';
import { defaultPlant } from '../lib/schema';
import { useParams } from 'react-router-dom';
import PlantForm from '../plants/PlantForm';


export default function PlantPage() {
    const [plant, setPlant] = useState(defaultPlant);
    const { plantId } = useParams<{ plantId: string }>();
    const { fetchPlantWithExams, updatePlant } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Single source of truth for loading exam data
    const loadPlant = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPlant = await fetchPlantWithExams(id);
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

            <PlantForm plant={plant} handleSubmit={handleSubmit} />

            {loading && plant.plant_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating exam...
                </Alert>
            )}

            {JSON.stringify(plant)}


        </>
    )
};