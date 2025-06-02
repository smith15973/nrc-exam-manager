import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, CircularProgress, Typography, Box } from '@mui/material';
import { defaultQuestion } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import QuestionForm from '../components/QuestionForm';


export default function QuestionPage() {
    const [question, setQuestion] = useState(defaultQuestion);
    const { questionId } = useParams<{ questionId: string }>();
    const { getQuestionComplete, updateQuestion } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Single source of truth for loading question data
    const loadQuestion = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const fetchedQuestion = await getQuestionComplete(id);
            if (fetchedQuestion) {
                setQuestion(fetchedQuestion);
            } else {
                setError('Question not found');
            }
        } catch (err) {
            setError('Failed to load question');
            console.error('Failed to load question:', err);
        } finally {
            setLoading(false);
        }
    };


    // Only fetch when questionId changes (initial load)
    useEffect(() => {
        if (questionId) {
            loadQuestion(parseInt(questionId));
        }
    }, [questionId]);

    const handleSubmit = async (updatedQuestion: Question) => {
        try {
            setLoading(true);
            setError(null);

            // Update the question
            await updateQuestion(updatedQuestion);

            // Explicitly refetch to get the updated data with fresh plant info
            if (updatedQuestion.question_id) {
                await loadQuestion(updatedQuestion.question_id);
            }
        } catch (err) {
            setError('Failed to update question');
            console.error("Failed to update question:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && question.question_id === undefined) {
        // Initial loading state
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
            </div>
        );
    }


    return (
        <>
            <QuestionForm question={question} handleSubmit={handleSubmit} />
            <Typography variant='h4' sx={{ pb: 2 }}>Question: {question.question_text}</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}



            {loading && question.question_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating question...
                </Alert>
            )}
            <Box>
                Sys #'s
                <Box>System</Box>
            </Box>

            <Box>
                KA #'s:
                <Box>Statement</Box>
                <Box>Importance</Box>
            </Box>
            
            <Box>Category: {question.category}</Box>
            <Box>Exam Level: {question.exam_level}</Box>
            <Box>Technical References: {question.technical_references}</Box>
            <Box>Difficutly Level: {question.difficulty_level}</Box>
            <Box>Cognitive Level: {question.cognitive_level}</Box>
            <Box>Objective: {question.objective}</Box>
            <Box>Last Used: {question.last_used}</Box>
            <Box>{question.answers?.map(answer => {
                return (
                    <Box key={answer.option} sx={{ backgroundColor: answer.is_correct ? 'green' : '' }}>
                        {answer.option}: {answer.answer_text}
                    </Box>
                )
            })}</Box>
            {/* <p>{JSON.stringify(question)}</p> */}


        </>
    )
};