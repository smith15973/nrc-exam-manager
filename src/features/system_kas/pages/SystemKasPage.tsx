
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import SystemKaForm from '../components/SystemKaForm';
import { useEffect, useState } from 'react';
import SystemKasList from '../components/SystemKaList';


export default function SystemKasPage() {
    const [system_kas, setSystemKas] = useState<SystemKa[]>([]);
    const { addSystemKa, getSystemKas, deleteSystemKa } = useDatabase();

    const loadSystemKas = async () => {
        const fetchedSystemKas = await getSystemKas();
        // console.log(fetchedSystemKas)
        setSystemKas(fetchedSystemKas);
    }

    useEffect(() => {
        loadSystemKas();
    }, [])

    const handleSubmit = async (system_ka: SystemKa) => {
        await addSystemKa(system_ka);
        loadSystemKas();

    }

    const handleDelete = async (system_kaNum: string) => {
        await deleteSystemKa(system_kaNum);
        loadSystemKas();
    }

    return (
        <>
            <Typography variant='h4'>SystemKas</Typography>
            <SystemKaForm handleSubmit={handleSubmit} />
            <SystemKasList system_kas={system_kas} deleteSystemKa={handleDelete} />


        </>
    )
}