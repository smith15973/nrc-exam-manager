import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultSystem } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import SystemForm from '../components/SystemForm';


export default function SystemPage() {
    const [system, setSystem] = useState<System>(defaultSystem);
    const { systemNum } = useParams<{ systemNum: string }>();
    const { updateSystem, getSystem } = useDatabase();

    const loadSystem = async (sysNum: string) => {
        try {
            const fetchedSystem = await getSystem({ number: sysNum })
            if (fetchedSystem) {
                setSystem(fetchedSystem);
            }
        } catch (err) {

            console.error('Failed to load exam:', err);
        }
    };

    const handleSubmit = async (updatedSystem: System) => {
        await updateSystem(updatedSystem)
        if (updatedSystem.system_number) {
            await loadSystem(updatedSystem.system_number)
        }
    }

    useEffect(() => {
        if (systemNum) {
            loadSystem(systemNum);
        }
    }, [systemNum])


    return (
        <>
            <Typography variant='h4'>System: {system.system_number} {system.system_name}</Typography>
            <SystemForm system={system} handleSubmit={handleSubmit} />



        </>
    )
}