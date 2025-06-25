import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultSystemKa } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import SystemKaForm from '../components/SystemKaForm';


export default function SystemKaPage() {
    const [system_ka, setSystemKa] = useState<SystemKa>(defaultSystemKa);
    const { system_kaNum } = useParams<{ system_kaNum: string }>();
    const { updateSystemKa, getSystemKa } = useDatabase();

    const loadSystemKa = async (system_kaNum: string) => {
        try {
            const fetchedSystemKa = await getSystemKa({ system_ka_number: system_kaNum })
            if (fetchedSystemKa) {
                setSystemKa(fetchedSystemKa);
            }
        } catch (err) {

            console.error('Failed to load exam:', err);
        }
    };

    const handleSubmit = async (updatedSystemKa: SystemKa) => {
        await updateSystemKa(updatedSystemKa)
        if (updatedSystemKa.system_ka_number) {
            await loadSystemKa(updatedSystemKa.system_ka_number)
        }
    }

    useEffect(() => {
        if (system_kaNum) {
            loadSystemKa(system_kaNum);
        }
    }, [system_kaNum])


    return (
        <>
            <Typography variant='h4'>SystemKa: {system_ka.system_ka_number} {system_ka.system_ka_number}</Typography>
            <SystemKaForm system_ka={system_ka} handleSubmit={handleSubmit} />



        </>
    )
}