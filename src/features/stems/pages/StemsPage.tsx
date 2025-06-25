
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import StemForm from '../components/StemForm';
import { useEffect, useState } from 'react';
import StemsList from '../components/StemsList';


export default function StemsPage() {
    const [stems, setStems] = useState<Stem[]>([]);
    const { addStem, getStems, deleteStem } = useDatabase();

    const loadStems = async () => {
        const fetchedStems = await getStems();
        setStems(fetchedStems);
    }

    useEffect(() => {
        loadStems();
    }, [])

    const handleSubmit = async (stem: Stem) => {
        await addStem(stem);
        loadStems();

    }

    const handleDelete = async (sysNum: string) => {
        await deleteStem(sysNum);
        loadStems();
    }

    return (
        <>
            <Typography variant='h4'>Stems</Typography>
            <StemForm handleSubmit={handleSubmit} />
            <StemsList stems={stems} deleteStem={handleDelete} />


        </>
    )
}