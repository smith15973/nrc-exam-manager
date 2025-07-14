import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, Box, Switch, FormControlLabel } from '@mui/material';
import { defaultExamQuestion } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
// import QuestionForm from '../components/QuestionForm';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import QuestionTemplate from '../../../features/questions/components/QuestionTemplate';
import QuestionFormModal from '../../../features/questions/components/QuestionForm';


export default function ExamQuestionPage() {
    const [examQuestion, setExamQuestion] = useState(defaultExamQuestion);
    const { questionId, examId } = useParams<{ questionId: string, examId: string }>();
    const { getExamQuestionWithDetails, deleteExamQuestion, updateQuestion } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState(false);


    // Single source of truth for loading question data
    const loadExamQuestion = async () => {
        try {
            setLoading(true);
            setError(null);
            if (questionId && examId) {
                const fetchedExamQuestion = await getExamQuestionWithDetails({ question_id: parseInt(questionId), exam_id: parseInt(examId) });
                if (fetchedExamQuestion) {
                    setExamQuestion(fetchedExamQuestion);
                } else {
                    setError('Exam Question not found');
                }
            } else {
                throw new Error('Missing questionId or examId');
            }
        } catch (err) {
            setError('Failed to load exam question');
            console.error('Failed to load exam question:', err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {

        loadExamQuestion();

    }, [questionId, examId]);

    const handleSubmit = async (updatedQuestion: Question) => {
        await updateQuestion(updatedQuestion);
        if (questionId) {
            loadExamQuestion();
        }
    }


    return (
        <>

            <QuestionFormModal onSubmit={handleSubmit} question={examQuestion.question} />
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

            {examQuestion.question && (
                <QuestionTemplate question={examQuestion.question} student={student} examQuestionData={examQuestion} />
            )}
        </>
    )
}