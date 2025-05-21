import { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultPlant } from '../lib/schema';

interface PlantPageProps {
    plantId: number;
}

export default function PlantsList(props: PlantPageProps) {
    const [plant, setPlant] = useState(defaultPlant);
    const { plantId } = props;
    const { fetchPlant } = useDatabase();



    useEffect(() => {
        if (plantId) {
            fetchPlant(plantId).then((fetchedPlant) => {
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