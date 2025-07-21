import { useEffect, useState } from 'react';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Alert, CircularProgress, FormControlLabel, Switch, Typography, Box, Button } from '@mui/material';
import { defaultExam } from '../../../data/db/schema';
import { Link, useParams } from 'react-router-dom';
import ExamForm from '../components/ExamForm';
import ImportViewer from '../../../features/questions/components/ImportViewer';
import QuestionsTable from '../../../features/questions/components/QuestionsTable';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ExportQuestionsButton from '../../../features/questions/components/ExportQuestionsButton';
import QuestionForm from '../../../features/questions/components/QuestionForm';
import QuestionTemplate from '../../../features/questions/components/QuestionTemplate';
import { Language } from '@mui/icons-material';


export default function ExamPage() {
    const [exam, setExam] = useState(defaultExam);
    const { examId: examIdParam } = useParams<{ examId: string }>();
    const examId = examIdParam ? parseInt(examIdParam, 10) : undefined;
    const { getExamById,
        updateExam,
        addQuestionsBatch,
        removeQuestionFromExam,
        addQuestion,
        getQuestionsComplete
    } = useDatabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [tableView, setTableView] = useState(true);
    const [student, setStudent] = useState(false);
    const [filters, setFilters] = useState<QuestionFilters>();



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
            const questions = await getQuestionsComplete(filters);
            setExamQuestions(questions)

        } catch (err) {
            setError("Failed to load exam questions")
        }
    }


    // Only fetch when examId changes (initial load)
    useEffect(() => {
        if (examId) {
            loadExam();
            loadQuestions();
            setFilters((prev) => {
                const newFilters = { ...prev };
                if (examId && (!newFilters.examIds || !newFilters.examIds.includes(examId))) {
                    newFilters.examIds = newFilters.examIds ? [...newFilters.examIds, examId] : [examId];
                }
                return newFilters;
            });
        }
    }, [examId]);
    // Only fetch when examId changes (initial load)
    useEffect(() => {
        loadQuestions();
    }, [filters]);

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
        // console.log(questionIds)
        const result = await window.files.export.questions(questionIds);
        // console.log(result);
    }

    const handleImport = async (questions: Question[]) => {
        const result = await addQuestionsBatch(questions)
        // console.log(result)
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

    const handleFilterChange = (key: string, value: unknown) => {
        // console.log(value);
        setFilters((prev) => {
            const newFilters = { ...prev, [key]: value };
            if (examId && (!newFilters.examIds || !newFilters.examIds.includes(examId))) {
                newFilters.examIds = newFilters.examIds ? [...newFilters.examIds, examId] : [examId];
            }
            return newFilters;
        });
        // loadQuestions();
    }


    return (
        <>


            <Box sx={{ display: 'flex' }}>
                <Typography sx={{ pb: 2 }} variant='h4'>Exam: {exam.name} - {exam.plant?.name}</Typography>
                <ExamForm exam={exam} handleSubmit={handleSubmit} />
            </Box>
            <Box>
                {exam.nrc_url ? (
                    <Button
                        type="button"
                        variant="text"
                        onClick={() => exam.nrc_url && window.electronAPI.openExternal(exam.nrc_url)}
                        startIcon={<Language/>}
                    >
                        View in Adams Database
                    </Button>
                ) : ''}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading && exam.exam_id && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Updating exam...
                </Alert>
            )}

            {/* <QuestionForm examId={examId} onSubmit={handleCreateNewQuestion} />
            <ImportViewer onSubmit={handleImport} /> */}
            <ExportQuestionsButton questionIds={selectedIds} onExport={() => setSelectedIds([])} />
            <ConfirmDelete
                onConfirmDelete={handleRemoveQuestionFromExam}
                buttonText="Remove From Exam"
                message={`Are you sure you want to remove these questions from this exam?`}
                disabled={!selectedIds.length}
            />

            <Box sx={{ display: 'flex' }}>
                <FormControlLabel
                    // sx={{ flex: 1 }}
                    control={<Switch checked={tableView} onChange={(e) => setTableView(e.currentTarget.checked)} />}
                    label="Table View"
                    labelPlacement='start'
                />
                <FormControlLabel
                    // sx={{ flex: 1 }}
                    control={<Switch checked={student} onChange={(e) => setStudent(e.currentTarget.checked)} />}
                    label="Student View"
                    labelPlacement='start'
                />
            </Box>

            {tableView ?
                <QuestionsTable
                    questions={examQuestions}
                    checkable
                    selectedIds={selectedIds}
                    onSelectionChange={onSelectionChange}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={() => setFilters({})}
                    examId={examId}
                /> : examQuestions?.map((examQuestion) => {
                    const examQuestionData = examQuestion.question_exams?.find(qe => qe.exam_id === examId)
                    return (
                        <QuestionTemplate key={examQuestion.question_id} question={examQuestion} examName={exam.name} student={student} examQuestionData={examQuestionData} />
                    )
                })}




        </>
    )
}