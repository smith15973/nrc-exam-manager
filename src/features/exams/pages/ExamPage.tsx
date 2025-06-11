import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, Button, CircularProgress, Typography } from '@mui/material';
import { defaultExam } from '../../../data/db/schema';
import { useParams } from 'react-router-dom';
import ExamForm from '../components/ExamForm';
import ImportViewer from '../../../features/questions/components/ImportViewer';
import QuestionsTable from '../../../features/questions/components/QuestionsTable';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ExportQuestionsButton from '../../../features/questions/components/ExportQuestionsButton';
import QuestionForm from '../../../features/questions/components/QuestionForm';


export default function ExamPage() {
    const [exam, setExam] = useState(defaultExam);
    const { examId: examIdParam } = useParams<{ examId: string }>();
    const examId = examIdParam ? parseInt(examIdParam, 10) : undefined;
    const { getExamById,
        updateExam,
        getQuestionsByExamId,
        addQuestionsBatch,
        removeQuestionFromExam,
        addExamQuestion,
        addQuestion
    } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);



    // Single source of truth for loading exam data
    const loadExam = async () => {

        try {
            setLoading(true);
            setError(null);
            if (!examId) throw new Error("No examId provided");
            const fetchedExam = await getExamById(examId);
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

    const loadQuestions = async () => {
        try {
            if (!examId) throw new Error("No examId provided");
            const questions = await getQuestionsByExamId(examId);
            setExamQuestions(questions);
        } catch (err) {
            setError("Failed to load exam questions");
            console.error("Failed to load exam questions:", err);
        }
    };


    // Only fetch when examId changes (initial load)
    useEffect(() => {
        if (examId) {
            loadExam();
            loadQuestions();
        }
    }, [examId]);

    const handleSubmit = async (updatedExam: Exam) => {
        try {
            setLoading(true);
            setError(null);

            // Update the exam
            await updateExam(updatedExam);

            // Explicitly refetch to get the updated data with fresh plant info

            await loadExam();
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

    const handleImport = async (questions: Question[]) => {
        const result = await addQuestionsBatch(questions)
        console.log(result)
        await loadQuestions();
    }

    const handleRemoveQuestionFromExam = async () => {
        if (examId) {
            Promise.all(selectedIds.map(selectedId => removeQuestionFromExam(examId, selectedId)));
            if (examId) {
                loadExam();
                loadQuestions();
            }
            setSelectedIds([]);
        }
    }

    const onSelectionChange = (newSelectedIds: number[]) => {
        setSelectedIds(newSelectedIds)
    }

    const handleCreateNewQuestion = async (question: Question) => {
        await addQuestion(question)
        await loadQuestions();
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

            <QuestionForm examId={examId} onSubmit={handleCreateNewQuestion} />
            <ImportViewer onSubmit={handleImport} />
            <ExportQuestionsButton questionIds={selectedIds} />
            <ConfirmDelete
                onConfirmDelete={handleRemoveQuestionFromExam}
                buttonText="Remove From Exam"
                message={`Are you sure you want to remove these questions from this exam?`}
                disabled={!selectedIds.length}
            />
            <QuestionsTable
                questions={examQuestions}
                checkable
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
            />




        </>
    )
};