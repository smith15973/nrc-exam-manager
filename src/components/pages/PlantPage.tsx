import React from 'react';
import PlantsForm from '../plants/PlantForm';
import PlantsList from '../plants/PlantsList';
import { useDatabase } from '../hooks/useDatabase';


const PlantPage: React.FC = () => {

    const { plants, deletePlant, error } = useDatabase();

    return (
        <>
            <PlantsForm />
            <PlantsList plants={plants} deletePlant={deletePlant} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    )
};

export default PlantPage;