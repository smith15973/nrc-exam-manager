import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, Box, Switch, FormControlLabel } from '@mui/material';
import { defaultExamQuestion } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
// import QuestionForm from '../components/QuestionForm';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import QuestionTemplate from '../../../features/questions/components/QuestionTemplate';


export default function ExamQuestionPage() {
    const [examQuestion, setExamQuestion] = useState(defaultExamQuestion);
    const { questionId, examId } = useParams<{ questionId: string, examId: string }>();
    const { getExamQuestionsWithDetails, deleteExamQuestion } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState(false);


    // Single source of truth for loading question data
    const loadExamQuestion = async (questionId: number, examId: number) => {
        try {
            setLoading(true);
            setError(null);
            const fetchedExamQuestion = await getExamQuestionsWithDetails({ question_id: questionId, exam_id: examId });
            console.log('fetched', fetchedExamQuestion)
            if (fetchedExamQuestion[0]) {
                setExamQuestion(fetchedExamQuestion[0]);
            } else {
                setError('Exam Question not found');
            }
        } catch (err) {
            setError('Failed to load exam question');
            console.error('Failed to load exam question:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (questionId && examId) {
            loadExamQuestion(parseInt(questionId), parseInt(examId));
        }
    }, [questionId, examId]);


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
                {/* <QuestionForm question={question} onSubmit={handleSubmit} /> */}
                <ConfirmDelete
                    message='Are you sure you want to delete this question? This will remove it from all exam associations! This action cannot be undone!'
                    onConfirmDelete={() => deleteExamQuestion({ examId: examQuestion.exam_id, questionId: examQuestion.question_id })}
                    redirectPath="/questions"
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}



            {loading && examQuestion.question_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating question...
                </Alert>
            )}

            <QuestionTemplate question={examQuestion} student={student} />
        </>
    )
}