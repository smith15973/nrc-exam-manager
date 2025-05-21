import PlantForm from '../plants/PlantForm';
import PlantsList from '../plants/PlantsList';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';


export default function PlantsPage() {
    const { plants, addPlant, deletePlant, error } = useDatabase();

    const handleSubmit = async (plant:Plant) => {
        await addPlant(plant);
    }

    return (
        <>
            <Typography variant='h4'>Plants</Typography>
            <PlantForm handleSubmit={handleSubmit} />
            <PlantsList plants={plants} deletePlant={deletePlant} />
            {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>}
        </>
    )
};