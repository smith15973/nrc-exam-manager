// KaPage.tsx
import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography, Alert, CircularProgress, Box } from '@mui/material';
import { defaultKa } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';

import KaForm from '../components/KaForm';
import { useErrorHandler } from '../../../common/hooks/useErrorHandler';

export default function KaPage() {
    const [ka, setKa] = useState<Ka>(defaultKa);
    const [isLoading, setIsLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);
    const { kaNum } = useParams<{ kaNum: string }>();
    const { updateKa, getKa, error: dbError, isLoading: dbLoading } = useDatabase();
    const { navigateToError } = useErrorHandler();

    const loadKa = async (kaNum: string) => {
        setIsLoading(true);
        setLocalError(null);

        try {
            const fetchedKa = await getKa({ ka_number: kaNum });

            if (fetchedKa) {
                setKa(fetchedKa);
            } else {
                // 404: KA not found
                navigateToError('notFound', `Ka with number "${kaNum}" was not found`);
            }
        } catch (err: any) {
            const message = err?.message?.toLowerCase?.() || '';

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
        setLocalError(null);

        try {
            await updateKa(updatedKa);

            // Only reload if there's no database error and we have a ka_number
            if (!dbError && updatedKa.ka_number) {
                await loadKa(updatedKa.ka_number);
            }
        } catch (err) {
            console.error('Failed to update ka:', err);
            setLocalError('Failed to update ka');
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

    // Show local errors (non-critical ones that don't require navigation)
    const displayError = localError || dbError;

    return (
        <>
            <Typography variant="h4">
                Ka: {ka.ka_number} {ka.stem_id}
            </Typography>

            {displayError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => {
                        setLocalError(null);
                        // Note: We can't clear dbError from here as it's managed by the hook
                    }}
                >
                    {displayError}
                </Alert>
            )}

            <KaForm ka={ka} handleSubmit={handleSubmit} />
        </>
    );
}