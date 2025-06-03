
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import SystemForm from '../components/SystemForm';
import { useEffect, useState } from 'react';
import SystemsList from '../components/SystemsList';


export default function SystemsPage() {
    const [systems, setSystems] = useState<System[]>([]);
    const { addSystem, getSystems, deleteSystem } = useDatabase();

    const loadSystems = async () => {
        const fetchedSystems = await getSystems();
        setSystems(fetchedSystems);
    }

    useEffect(() => {
        loadSystems();
    }, [])

    const handleSubmit = async (system: System) => {
        await addSystem(system);
        loadSystems();

    }

    return (
        <>
            <Typography variant='h4'>Systems</Typography>
            <SystemForm handleSubmit={handleSubmit} />
            <SystemsList systems={systems} deleteSystem={deleteSystem} />


        </>
    )
};