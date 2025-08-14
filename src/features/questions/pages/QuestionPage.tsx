import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, CircularProgress, Box, Switch, FormControlLabel } from '@mui/material';
import { defaultQuestion } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
// import QuestionForm from '../components/QuestionForm';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import QuestionTemplate from '../components/QuestionTemplate';
import QuestionFormModal from '../components/QuestionForm';


export default function QuestionPage() {
    const [question, setQuestion] = useState(defaultQuestion);
    const { questionId } = useParams<{ questionId: string }>();
    const { getQuestionComplete, deleteQuestion } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState(false);
    const { addQuestion, updateQuestion } = useDatabase();


    // Single source of truth for loading question data
    const loadQuestion = async () => {
        try {
            setLoading(true);
            setError(null);
            if (questionId) {
                const fetchedQuestion = await getQuestionComplete(parseInt(questionId));

                if (fetchedQuestion) {
                    setQuestion(fetchedQuestion);
                } else {
                    setError('Question not found');
                }
            } else {
                throw new Error('No questionId provided');
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
            loadQuestion();
        }
    }, [questionId]);

    if (loading && question.question_id === undefined) {
        // Initial loading state
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <CircularProgress />
            </div>
        );
    }

    const handleEditQuestion = async (updatedQuestion: Question) => {
        await updateQuestion(updatedQuestion);
        if (questionId) {
            loadQuestion();
        }
    }
    const handleDuplicateQuestion = async (duplicatedQuestion: Question) => {
        await addQuestion(duplicatedQuestion);
        if (questionId) {
            loadQuestion();
        }
    }


    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'right' }}>
                <FormControlLabel
                    control={<Switch checked={student} onChange={(e) => setStudent(e.currentTarget.checked)} />}
                    label="Student View"
                    labelPlacement='start'
                />
            </Box>
            <Box display={'flex'} justifyContent={'space-between'}>
                <Box display="flex" gap={2}>
                    <QuestionFormModal onSubmit={handleEditQuestion} question={question} />
                    <QuestionFormModal
                        onSubmit={handleDuplicateQuestion}
                        question={{ ...question, question_id: 0 }} // removes ID for the child
                        buttonText="Duplicate"
                    />

                </Box>

                <ConfirmDelete
                    message='Are you sure you want to delete this question? This will remove it from all exam associations! This action cannot be undone!'
                    onConfirmDelete={() => deleteQuestion(question.question_id)}
                    redirectPath="/questions"
                />
            </Box>

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

            <QuestionTemplate question={question} student={student} />
        </>
    )
}