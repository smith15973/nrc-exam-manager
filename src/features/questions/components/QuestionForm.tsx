import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema, defaultAnswer } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswerForm from '../../answers/components/AnswerForm';
import { FormDialog } from '../../../common/components/FormDialog';
import CheckExams from '../../exams/components/CheckExams';
import CheckSystems from '../../systems/components/CheckSystems';
import CheckKas from '../../kas/components/CheckKas';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    handleSubmit: (question: Question) => void;
}

export default function QuestionForm(props: QuestionFormProps) {
    const { question, handleSubmit, exam } = props;
    const [questionForm, setQuestionForm] = useState<Question>(question || defaultQuestion);
    const [selectedExams, setSelectedExams] = useState<number[]>([])
    const [selectedSystems, setSelectedSystems] = useState<string[]>([])
    const [selectedKas, setSelectedKas] = useState<string[]>([])
    const [open, setOpen] = useState(false);
    const { exams, systems, kas } = useDatabase();

    useEffect(() => {
        if (question) {
            setQuestionForm(question);
        }
    }, [question, exam]);

    useEffect(() => {
        const examIds = questionForm.exams?.map(exam => exam.exam_id).filter((id): id is number => id !== undefined) || [];
        setSelectedExams(examIds);
    }, [questionForm.exams]);

    useEffect(() => {
        const systemNums = questionForm.systems?.map(system => system.number).filter((num): num is string => num !== undefined) || [];
        setSelectedSystems(systemNums);
    }, [questionForm.systems]);

    useEffect(() => {
        const kaNums = questionForm.kas?.map(ka => ka.ka_number).filter((num): num is string => num !== undefined) || [];
        setSelectedKas(kaNums);
    }, [questionForm.kas])


    const handleChange = (key: string, value: any) => {
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAnswerChange = (newAnswer: Answer, index: number) => {
        setQuestionForm((prev) => {
            // Ensure answers is always a 4-element tuple
            let answers: [Answer, Answer, Answer, Answer];
            if (prev.answers && prev.answers.length === 4) {
                answers = [...prev.answers] as [Answer, Answer, Answer, Answer];
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

            return { ...prev, answers };
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

            setQuestionForm(prev => {
                const currentItems = (prev[formField] as unknown as T[]) || [];
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
                return {
                    ...prev,
                    [formField]: updatedItems
                };
            });
        };
    };
    const handleExamCheckChange = createSimpleCheckHandler(exams, 'exam_id', 'exams');
    const handleSystemCheckChange = createSimpleCheckHandler(systems, 'number', 'systems');
    const handleKaCheckChange = createSimpleCheckHandler(kas, 'ka_number', 'kas');

    const onSubmit = () => {
        handleSubmit(questionForm)
        setQuestionForm(defaultQuestion)
        setOpen(false);
    }

    const validateForm = () => {
        // Require question text
        if (!questionForm.question_text) { return false; }
        // Ensure exactly one answer is marked correct
        const correctCount = questionForm.answers?.filter(a => a.is_correct).length || 0;
        if (correctCount !== 1) { return false; }
        // Ensure all answers have non-empty text
        if (!questionForm.answers?.every(a => a.answer_text && a.answer_text.trim() !== '')) { return false; }
        return true;
    };

    // Responsive container styles
    const containerSx: SxProps = {
        pt: 2,
        display: 'grid',
        gridTemplateColumns: {
            xs: '1fr',           // Single column on extra small screens
            sm: '1fr',           // Single column on small screens
            md: '1fr 1fr',       // Two equal columns on medium+ screens
        },
        gap: 2,
        '@media (max-width: 900px)': {
            gridTemplateColumns: '1fr', // Stack when width gets too small
        }
    };

    return (
        <>
            <FormDialog
                open={open}
                title={`${question ? 'Edit' : 'Add'} Question`}
                submitText={`${question ? 'Update' : 'Add'} Question`}
                onSubmit={onSubmit}
                onClose={() => setOpen(false)}
                validate={validateForm}
                maxWidth='lg'
                fullWidth={true}
            >
                <Box sx={containerSx}>
                    {/* Question Form Section */}
                    <Box>
                        {questionSchema.map((field) => {
                            // Skip plant_id as we'll handle it separately with a Select
                            if (field.key === 'plant_id') return null;

                            return (
                                <Box sx={{ pb: 2 }} key={field.key}>
                                    <TextField
                                        fullWidth
                                        type={field.type}
                                        value={(questionForm as any)[field.key] || ''}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        label={field.label}
                                        required={field.required}
                                    />
                                </Box>
                            );
                        })}

                        <Box sx={{ pb: 2 }} >
                            <CheckExams
                                examOptions={exams}
                                handleChange={handleExamCheckChange}
                                selectedIdList={selectedExams}
                            />
                        </Box>
                        <Box sx={{ pb: 2 }} >
                            <CheckSystems
                                systemOptions={systems}
                                handleChange={handleSystemCheckChange}
                                selectedIdList={selectedSystems}
                            />
                        </Box>
                        <Box sx={{ pb: 2 }} >
                            <CheckKas
                                kaOptions={kas}
                                handleChange={handleKaCheckChange}
                                selectedIdList={selectedKas}
                            />
                        </Box>
                    </Box>

                    {/* Answers Section */}
                    <Box>
                        {questionForm.answers?.map((answer, idx) => {
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
            </FormDialog>

            <Button
                variant="contained"
                onClick={() => setOpen(true)}
            >
                {question ? 'Edit' : 'Add'} Question
            </Button>
        </>
    );
}