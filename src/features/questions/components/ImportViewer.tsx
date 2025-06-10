import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema, defaultAnswer } from '../../../data/db/schema';
import { Box, TextField, SxProps, Button, Typography, Alert } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswerForm from '../../answers/components/AnswerForm';
import CheckExams from '../../exams/components/CheckExams';
import CheckSystems from '../../systems/components/CheckSystems';
import CheckKas from '../../kas/components/CheckKas';
import { FormDialog } from '../../../common/components/FormDialog';

interface ImportViewerProps {
    onSubmit: (questions: Question[]) => void
}

export default function ImportViewer({ onSubmit }: ImportViewerProps) {
    const [open, setOpen] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewedQuestions, setReviewedQuestions] = useState<Question[]>([]);
    const { exams, systems, kas } = useDatabase();
    const [importErrors, setImportErrors] = useState<string[]>([]);

    // Fix: Derive currentQuestion from reviewedQuestions after they're updated
    const currentQuestion = reviewedQuestions[currentIndex] || defaultQuestion;

    const selectedExams = currentQuestion.exams?.map(exam => exam.exam_id).filter((id): id is number => id !== undefined) || [];
    const selectedSystems = currentQuestion.systems?.map(system => system.number).filter((num): num is string => num !== undefined) || [];
    const selectedKas = currentQuestion.kas?.map(ka => ka.ka_number).filter((num): num is string => num !== undefined) || [];

    const handleChange = (key: string, value: any) => {
        setReviewedQuestions(prev => {
            const updated = [...prev];
            updated[currentIndex] = { ...updated[currentIndex], [key]: value };
            return updated;
        });
    };

    const handleAnswerChange = (newAnswer: Answer, index: number) => {
        setReviewedQuestions(prev => {
            const updated = [...prev];
            const currentQ = updated[currentIndex];

            // Ensure answers is always a 4-element tuple
            let answers: [Answer, Answer, Answer, Answer];
            if (currentQ.answers && currentQ.answers.length === 4) {
                answers = [...currentQ.answers] as [Answer, Answer, Answer, Answer];
            } else {
                answers = [defaultAnswer, defaultAnswer, defaultAnswer, defaultAnswer];
            }

            // If newAnswer is marked correct, set all others to is_correct: false
            if (newAnswer.is_correct) {
                answers = answers.map((ans, i) =>
                    i === index ? { ...newAnswer } : { ...ans, is_correct: false }
                ) as [Answer, Answer, Answer, Answer];
            } else {
                answers[index] = { ...newAnswer };
            }

            updated[currentIndex] = { ...currentQ, answers };
            return updated;
        });
    };

    const createSimpleCheckHandler = function <T>(
        collection: T[],
        keyField: keyof T,
        formField: keyof Question
    ) {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const itemKey = event.currentTarget.name;
            const isChecked = event.currentTarget.checked;

            setReviewedQuestions(prev => {
                const updated = [...prev];
                const currentQ = updated[currentIndex];
                const currentItems = (currentQ[formField] as unknown as T[]) || [];
                let updatedItems;

                if (isChecked) {
                    const itemToAdd = collection.find(item => String((item as T)[keyField]) === itemKey);
                    if (itemToAdd && !currentItems.find(item => String(item[keyField]) === itemKey)) {
                        updatedItems = [...currentItems, itemToAdd];
                    } else {
                        updatedItems = currentItems;
                    }
                } else {
                    updatedItems = currentItems.filter(item => String(item[keyField]) !== itemKey);
                }

                updated[currentIndex] = {
                    ...currentQ,
                    [formField]: updatedItems
                };
                return updated;
            });
        };
    };

    const handleExamCheckChange = createSimpleCheckHandler(exams, 'exam_id', 'exams');
    const handleSystemCheckChange = createSimpleCheckHandler(systems, 'number', 'systems');
    const handleKaCheckChange = createSimpleCheckHandler(kas, 'ka_number', 'kas');

    const goToNext = () => {
        if (currentIndex < reviewedQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Responsive container styles
    const containerSx: SxProps = {
        // pt: 2,
        // display: 'grid',
        // gridTemplateColumns: {
        //     xs: '1fr',           // Single column on extra small screens
        //     sm: '1fr',           // Single column on small screens
        //     md: '1fr 1fr',       // Two equal columns on medium+ screens
        // },
        // gap: 2,
        // '@media (max-width: 900px)': {
        //     gridTemplateColumns: '1fr', // Stack when width gets too small
        // }
    };

    const handleImport = async () => {
        try {
            const result = await window.files.import.questions();

            if (result.questions && result.questions.length > 0) {
                setQuestions(result.questions);
                setOpen(true);
            } else {
                console.error('Import failed or no questions returned:', result);
            }

            // Set import errors for display
            if (result.stats?.warnings && result.stats.warnings.length > 0) {
                setImportErrors(result.stats.warnings);
            } else {
                setImportErrors([]);
            }
        } catch (error) {
            console.error('Error during import:', error);
            setImportErrors([`Import failed: ${error.message || 'Unknown error'}`]);
        }
    };

    // Fix: Update reviewedQuestions when questions change
    useEffect(() => {
        if (questions.length > 0) {
            setReviewedQuestions(questions);
            setCurrentIndex(0);
        }
    }, [questions]);

    const handleClose = () => {
        setQuestions([]);
        setReviewedQuestions([]);
        setCurrentIndex(0);
        setImportErrors([]);
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log('Submitting reviewed questions:', reviewedQuestions);
        onSubmit(reviewedQuestions);
        setOpen(false);
    }

    function errorDisplay() {
        return (
            <>
                {importErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Import Warnings:</Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {importErrors.map((error, index) => (
                                <Typography component="li" key={index} variant="body2">
                                    {error}
                                </Typography>
                            ))}
                        </Box>
                    </Alert>
                )}
            </>
        )
    }

    return (
        <>
            <FormDialog
                open={open}
                title="Import Questions"
                submitText='Done'
                onSubmit={handleSubmit}
                onClose={handleClose}
                fullWidth
            >
                {reviewedQuestions.length > 0 ? (
                    <>
                        {errorDisplay()}
                        {/* Header with navigation */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                            <Typography variant="h6">
                                Question {currentIndex + 1} of {reviewedQuestions.length}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={goToPrevious}
                                    disabled={currentIndex === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={goToNext}
                                    disabled={currentIndex === reviewedQuestions.length - 1}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>

                        {/* Question Form Layout */}
                        <Box sx={containerSx}>
                            {/* Question Form Section */}
                            <Box>
                                {questionSchema.map((field) => {
                                    // Skip last_used as we'll handle it separately with a date select
                                    if (field.key === 'last_used') return null;

                                    return (
                                        <Box sx={{ pb: 2 }} key={field.key}>
                                            <TextField
                                                fullWidth
                                                type={field.type}
                                                value={(currentQuestion as any)[field.key] || ''}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                label={field.label}
                                                required={field.required}
                                                rows={field.key === 'question_text' ? 5 : undefined}
                                                multiline={field.key === 'question_text' ? true : undefined}
                                            />
                                        </Box>
                                    );
                                })}

                                <Box sx={{ pb: 2 }}>
                                    <TextField
                                        fullWidth
                                        type={'date'}
                                        value={currentQuestion.last_used || ''}
                                        onChange={(e) => handleChange('last_used', e.target.value)}
                                        label={'Last Used'}
                                        required={false}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Box>

                                <Box sx={{ pb: 2 }}>
                                    <CheckExams
                                        examOptions={exams}
                                        handleChange={handleExamCheckChange}
                                        selectedIdList={selectedExams}
                                    />
                                </Box>
                                <Box sx={{ pb: 2 }}>
                                    <CheckSystems
                                        systemOptions={systems}
                                        handleChange={handleSystemCheckChange}
                                        selectedIdList={selectedSystems}
                                    />
                                </Box>
                                <Box sx={{ pb: 2 }}>
                                    <CheckKas
                                        kaOptions={kas}
                                        handleChange={handleKaCheckChange}
                                        selectedIdList={selectedKas}
                                    />
                                </Box>
                            </Box>

                            {/* Answers Section */}
                            <Box>
                                {currentQuestion.answers?.map((answer, idx) => {
                                    return (
                                        <AnswerForm
                                            updateQuestionForm={(newAnswer) => handleAnswerChange(newAnswer, idx)}
                                            answer={answer}
                                            key={idx}
                                        />
                                    )
                                })}
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Typography>No questions to display. Try importing again.</Typography>
                )}
            </FormDialog>



            <Button onClick={handleImport}>Import Questions</Button>
            {/* Display import errors if any */}
            {reviewedQuestions.length === 0 ? errorDisplay() : null}
        </>
    );
}