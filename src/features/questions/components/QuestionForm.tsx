import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema, defaultAnswer, defaultExam, defaultSystem, defaultKa } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswerForm from '../../answers/components/AnswerForm';
import MultiExamSelect from '../../exams/components/MultiExamSelect';
import { FormDialog } from '../../../common/components/FormDialog';
import MultiSystemSelect from '../../systems/components/MultiSystemSelect';
import MultiKaSelect from '../../kas/components/MultiKaSelect'
import CheckExams from '../../exams/components/CheckExams';

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
        const systemNums = questionForm.systems?.map(system => system.number).filter((num): num is string => num !== undefined) || [];
        setSelectedSystems(systemNums);
        const kaNums = questionForm.kas?.map(ka => ka.ka_number).filter((num): num is string => num !== undefined) || [];
        setSelectedKas(kaNums);
    }, [questionForm])

    useEffect(() => {
        const examIds = questionForm.exams?.map(exam => exam.exam_id).filter((id): id is number => id !== undefined) || [];
        setSelectedExams(examIds);
    }, [questionForm.exams]);

    const handleChange = (key: string, value: any) => {
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAnswerChange = (newAnswer: Answer) => {
        setQuestionForm((prev) => {
            // Ensure answers is always a 4-element tuple
            let answers: [Answer, Answer, Answer, Answer];
            if (prev.answers && prev.answers.length === 4) {
                answers = [...prev.answers] as [Answer, Answer, Answer, Answer];
            } else {
                answers = [defaultAnswer, defaultAnswer, defaultAnswer, defaultAnswer]
            }
            const index = answers.findIndex((ans) => ans.option === newAnswer.option);
            if (index !== -1) {
                answers[index] = { ...newAnswer };
            }
            return { ...prev, answers };
        });
    };

    const handleExamCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const examId = Number(event.currentTarget.name);
        const isChecked = event.currentTarget.checked;

        setQuestionForm(prev => {
            let updatedExams;

            if (isChecked) {
                // Add the exam if it's not already in the list
                const examToAdd = exams.find(exam => exam.exam_id === examId);
                if (examToAdd && !prev.exams?.find(exam => exam.exam_id === examId)) {
                    updatedExams = [...(prev.exams || []), examToAdd];
                } else {
                    updatedExams = prev.exams || [];
                }
            } else {
                // Remove the exam from the list
                updatedExams = (prev.exams || []).filter(exam => exam.exam_id !== examId);
            }

            return {
                ...prev,
                exams: updatedExams
            };
        });
    };

    const handleSystemsChange = (newSystemsList: string[]) => {
        setSelectedSystems(newSystemsList);

        // Sync with questionForm.exams
        const selectedSystems = systems.filter(system => newSystemsList.includes(system.number));
        setQuestionForm(prev => ({
            ...prev,
            systems: selectedSystems
        }));
    }

    const handleAddSystemClick = () => {
        setQuestionForm(prev => ({
            ...prev,
            systems: [...(prev.systems || []), defaultSystem]
        }));
    }

    const handleKasChange = (newKasList: string[]) => {
        setSelectedKas(newKasList);

        // Sync with questionForm.exams
        const selectedKas = kas.filter(ka => newKasList.includes(ka.ka_number));
        setQuestionForm(prev => ({
            ...prev,
            kas: selectedKas
        }));
    }

    const handleAddKaClick = () => {
        setQuestionForm(prev => ({
            ...prev,
            kas: [...(prev.kas || []), defaultKa]
        }));
    }

    const onSubmit = () => {
        handleSubmit(questionForm)
        setQuestionForm(defaultQuestion)
        setOpen(false);
    }

    const validateForm = () => {
        return !questionForm.question_text
    }

    // Responsive container styles
    const containerSx: SxProps = {
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

                        <MultiSystemSelect
                            systemList={selectedSystems}
                            systemOptions={systems}
                            handleAddSystemClick={handleAddSystemClick}
                            onSystemsUpdate={handleSystemsChange}
                        />
                        <MultiKaSelect
                            kaList={selectedKas}
                            kaOptions={kas}
                            handleAddKaClick={handleAddKaClick}
                            onKasUpdate={handleKasChange}
                        />
                        <CheckExams
                            examOptions={exams}
                            handleChange={handleExamCheckChange}
                            selectedIdList={selectedExams}
                        />
                    </Box>

                    {/* Answers Section */}
                    <Box>
                        {questionForm.answers?.map((answer, idx) => {
                            return (
                                <AnswerForm updateQuestionForm={handleAnswerChange} answer={answer} key={idx} />
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