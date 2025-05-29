import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, CircularProgress, Typography } from '@mui/material';
import { defaultExam } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import ExamForm from '../components/ExamForm';


export default function ExamPage() {
    const [exam, setExam] = useState(defaultExam);
    const { examId } = useParams<{ examId: string }>();
    const { exams, data } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Single source of truth for loading exam data
    const loadExam = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const result = await data({ entity: 'exams', action: 'read', data: id })
            if (result.success) {
                setExam(result.data);
            } else {
                setError(result.error || 'Failed to load exam');
            }
        } catch (err) {
            setError('Failed to load exam');
            console.error('Failed to load exam:', err);
        } finally {
            setLoading(false);
        }
    };


    // Only fetch when examId changes (initial load)
    useEffect(() => {
        if (examId) {
            loadExam(parseInt(examId));
        }
    }, [examId]);

    const handleSubmit = async (updatedExam: Exam) => {
        try {
            setLoading(true);
            setError(null);

            // Update the exam
            const result = await data({ entity: 'exams', action: 'update', data: updatedExam })
            if (result.success) {
                // loadExam(parseInt(examId));
            } else {
                setError(result.error || 'Failed to load exam');
            }

            // Explicitly refetch to get the updated data with fresh plant info
            if (updatedExam.exam_id) {
                await loadExam(updatedExam.exam_id);
            }
        } catch (err) {
            setError('Failed to update exam');
            console.error("Failed to update exam:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && exam.exam_id === undefined) {
        // Initial loading state
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
            </div>
        );
    }


    return (
        <>
            <Typography sx={{ pb: 2 }} variant='h4'>Exam: {exam.name} - {exam.plant?.name}</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <ExamForm exam={exam} handleSubmit={handleSubmit} />

            {loading && exam.exam_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating exam...
                </Alert>
            )}
            <p>{JSON.stringify(exam)}</p>


        </>
    )
};