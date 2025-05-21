import PlantsForm from '../plants/PlantForm';
import PlantsList from '../plants/PlantsList';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';


export default function PlantsPage() {
    const { plants, addPlant, deletePlant, error } = useDatabase();

    return (
        <>
            <Typography variant='h4'>Plants</Typography>
            <PlantsForm addPlant={addPlant} />
            <PlantsList plants={plants} deletePlant={deletePlant} />
            {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>}
        </>
    )
};