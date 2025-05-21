import { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultPlant } from '../lib/schema';
import { useParams } from 'react-router-dom';
import PlantForm from '../plants/PlantForm';


export default function PlantPage() {
    const [plant, setPlant] = useState(defaultPlant);
    const { plantId } = useParams<{ plantId: string }>();
    const { fetchPlant, updatePlant } = useDatabase();



    useEffect(() => {
        if (plantId) {
            fetchPlant(parseInt(plantId)).then((fetchedPlant) => {
                if (fetchedPlant) {
                    setPlant(fetchedPlant);
                }
            });
        }
    }, []);

    const handleSubmit = async (updatedPlant: Plant) => {
        try {
            const savedPlant = await updatePlant(updatedPlant);
            if (savedPlant) {
                setPlant(savedPlant);
            }
        } catch (err) {
            console.error("Failed to update plant:", err);
        }
    }

    return (
        <>
            <Typography variant='h4'>Hello {plant.name}</Typography>
            <PlantForm plant={plant} handleSubmit={handleSubmit} />


        </>
    )
};