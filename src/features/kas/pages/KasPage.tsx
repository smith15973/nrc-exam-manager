
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import KaForm from '../components/KaForm';
import { useEffect, useState } from 'react';
import KasList from '../components/KaList';


export default function KasPage() {
    const [kas, setKas] = useState<Ka[]>([]);
    const { addKa, getKas, deleteKa } = useDatabase();

    const loadKas = async () => {
        const fetchedKas = await getKas();
        setKas(fetchedKas);
    }

    useEffect(() => {
        loadKas();
    }, [])

    const handleSubmit = async (ka: Ka) => {
        await addKa(ka);
        loadKas();

    }

    return (
        <>
            <Typography variant='h4'>Kas</Typography>
            <KaForm handleSubmit={handleSubmit} />
            <KasList kas={kas} deleteKa={deleteKa} />


        </>
    )
};