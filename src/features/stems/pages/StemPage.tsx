import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultStem } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import StemForm from '../components/StemForm';


export default function StemPage() {
    const [stem, setStem] = useState<Stem>(defaultStem);
    const { stemId } = useParams<{ stemId: string }>();
    const { updateStem, getStem } = useDatabase();

    const loadStem = async (sysNum: string) => {
        try {
            const fetchedStem = await getStem({ number: sysNum })
            if (fetchedStem) {
                setStem(fetchedStem);
            }
        } catch (err) {

            console.error('Failed to load exam:', err);
        }
    };

    const handleSubmit = async (updatedStem: Stem) => {
        await updateStem(updatedStem)
        if (updatedStem.stem_id) {
            await loadStem(updatedStem.stem_id)
        }
    }

    useEffect(() => {
        if (stemId) {
            loadStem(stemId);
        }
    }, [stemId])


    return (
        <>
            <Typography variant='h4'>Stem: {stem.stem_id} {stem.stem_statement}</Typography>
            <StemForm stem={stem} handleSubmit={handleSubmit} />



        </>
    )
}