import PlantForm from '../components/PlantForm';
import PlantsList from '../components/PlantsList';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';


export default function PlantsPage() {
    const { addPlant, deletePlant, plantsWithExams, } = useDatabase();

    const handleSubmit = async (plant: Plant) => {
        await addPlant(plant);
    }

    return (
        <>
            <Typography variant='h4'>Plants</Typography>
            <PlantForm handleSubmit={handleSubmit} />
            <PlantsList plants={plantsWithExams} deletePlant={deletePlant} />
            {/* {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>} */}
        </>
    )
}