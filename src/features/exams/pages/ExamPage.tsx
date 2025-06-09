import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, Button, CircularProgress, Typography } from '@mui/material';
import { defaultExam } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import ExamForm from '../components/ExamForm';
import QuestionsList from '../../../features/questions/components/QuestionsList';


export default function ExamPage() {
    const [exam, setExam] = useState(defaultExam);
    const { examId } = useParams<{ examId: string }>();
    const { getExamById, updateExam, getQuestionsByExamId } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);


    // Single source of truth for loading exam data
    const loadExam = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const fetchedExam = await getExamById(id);
            if (fetchedExam) {
                setExam(fetchedExam);
            } else {
                setError('Exam not found');
            }
        } catch (err) {
            setError('Failed to load exam');
            console.error('Failed to load exam:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadQuestions = async (id: number) => {
        try {
            const questions = await getQuestionsByExamId(id);
            setExamQuestions(questions)

        } catch (err) {
            setError("Failed to load exam questions")
        }
    }


    // Only fetch when examId changes (initial load)
    useEffect(() => {
        if (examId) {
            loadExam(parseInt(examId));
            loadQuestions(parseInt(examId));
        }
    }, [examId]);

    const handleSubmit = async (updatedExam: Exam) => {
        try {
            setLoading(true);
            setError(null);

            // Update the exam
            await updateExam(updatedExam);

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

    const handleExport = async () => {

        const questionIds = examQuestions.map(question => question.question_id) ?? [];
        console.log(questionIds)
        const result = await window.files.export.questions(questionIds);
        console.log(result);
    }

    const handleImport = async () => {
        const result = await window.files.import.questions();
        console.log(result);

        
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
            <Button onClick={handleExport}>Export Exam</Button>
            <Button onClick={handleImport}>Import Questions</Button>

            {loading && exam.exam_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating exam...
                </Alert>
            )}

            <QuestionsList questions={examQuestions} deleteQuestion={() => { }} />


        </>
    )
};