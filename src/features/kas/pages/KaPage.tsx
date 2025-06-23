import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultKa } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import KaForm from '../components/KaForm';


export default function KaPage() {
    const [ka, setKa] = useState<Ka>(defaultKa);
    const { kaNum } = useParams<{ kaNum: string }>();
    const { updateKa, getKa } = useDatabase();

    const loadKa = async (kaNum: string) => {
        try {
            const fetchedKa = await getKa({ ka_number: kaNum })
            if (fetchedKa) {
                setKa(fetchedKa);
            }
        } catch (err) {

            console.error('Failed to load exam:', err);
        }
    };

    const handleSubmit = async (updatedKa: Ka) => {
        await updateKa(updatedKa)
        if (updatedKa.ka_number) {
            await loadKa(updatedKa.ka_number)
        }
    }

    useEffect(() => {
        if (kaNum) {
            loadKa(kaNum);
        }
    }, [kaNum])


    return (
        <>
            <Typography variant='h4'>Ka: {ka.ka_number} {ka.category_number}</Typography>
            <KaForm ka={ka} handleSubmit={handleSubmit} />



        </>
    )
};