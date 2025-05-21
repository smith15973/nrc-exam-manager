import { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultPlant } from '../lib/schema';
import { useParams } from 'react-router-dom';


export default function PlantsList() {
    const [plant, setPlant] = useState(defaultPlant);
    const { plantId } = useParams<{ plantId: string }>();
    const { fetchPlant } = useDatabase();



    useEffect(() => {
        if (plantId) {
            fetchPlant(parseInt(plantId)).then((fetchedPlant) => {
                if (fetchedPlant) {
                    setPlant(fetchedPlant);
                }
            });
        }
    }, [plantId]);

    return (
        <>
            <Typography variant='h4'>
                Hello {plant.name}
            </Typography>
        </>
    )
};