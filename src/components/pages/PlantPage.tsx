import React from 'react';
import PlantsForm from '../plants/PlantForm';
import PlantsList from '../plants/PlantsList';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';


const PlantPage: React.FC = () => {

    const { plants, addPlant, deletePlant, error } = useDatabase();

    return (
        <>
            <PlantsForm addPlant={addPlant} />
            <PlantsList plants={plants} deletePlant={deletePlant} />
            {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>}
        </>
    )
};

export default PlantPage;