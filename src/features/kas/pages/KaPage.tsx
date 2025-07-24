// KaPage.tsx
import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography, CircularProgress, Box } from '@mui/material';
import { defaultKa } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import KaForm from '../components/KaForm';
import { useErrorHandler } from '../../../common/hooks/useErrorHandler';

export default function KaPage() {
    const [ka, setKa] = useState<Ka>(defaultKa);
    const [isLoading, setIsLoading] = useState(true);
    const { kaNum } = useParams<{ kaNum: string }>();
    const { updateKa, getKa, isLoading: dbLoading } = useDatabase();
    const { navigateToError } = useErrorHandler();

    const loadKa = async (kaNum: string) => {
        setIsLoading(true);

        try {
            const fetchedKa = await getKa({ ka_number: kaNum });

            if (fetchedKa) {
                setKa(fetchedKa);
            } else {
                // 404: KA not found
                navigateToError('notFound', `Ka with number "${kaNum}" was not found`);
            }
        } catch (err: unknown) {
            const message = (err instanceof Error ? err.message : '').toLowerCase();

            // Network/database-specific
            if (message.includes('database') || message.includes('connection')) {
                navigateToError('network', 'Database connection failed while loading KA.');
            } else {
                navigateToError('general', 'An unexpected error occurred while loading KA.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (updatedKa: Ka) => {
        try {
            await updateKa(updatedKa); // if this fails in a toast-worthy way, it's already handled in the hook
            if (updatedKa.ka_number) {
                await loadKa(updatedKa.ka_number); // could throw and navigateToError
            }
        } catch (err) {
            // only catches if hook *throws* — and you want to do something critical like navigateToError
            navigateToError('general', 'Unexpected failure while saving');
        }
    };


    useEffect(() => {
        if (kaNum) {
            loadKa(kaNum);
        } else {
            // If no kaNum in URL, navigate to error page
            navigateToError('notFound', 'No Ka number specified in URL');
        }
    }, [kaNum]);

    // Show loading state
    if (isLoading || dbLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading Ka details...
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Typography variant="h4">
                Ka: {ka.ka_number} {ka.stem_id}
            </Typography>

            <KaForm ka={ka} handleSubmit={handleSubmit} />
        </>
    );
}