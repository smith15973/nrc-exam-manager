import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswerForm from './AnswerForm';
import { FormDialog } from '../../../common/components/FormDialog';
import CheckExams from '../../exams/components/CheckExams';
import CheckSystems from '../../systems/components/CheckSystems';
import CheckKas from '../../kas/components/CheckKas';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    onSubmit: (question: Question) => void;
    examId?: number;
}

export default function QuestionForm(props: QuestionFormProps) {
    const { question, onSubmit, exam, examId } = props;
    const [questionForm, setQuestionForm] = useState<Question>(question || defaultQuestion);
    const [selectedExams, setSelectedExams] = useState<number[]>([])
    const [selectedSystemKas, setSelectedSystemKas] = useState<string[]>([])
    const [open, setOpen] = useState(false);
    const { exams, systems, kas } = useDatabase();

    const answers: [Answer, Answer, Answer, Answer] = [
        {
            answer_text: questionForm?.answer_a,
            justification: questionForm.answer_a_justification,
            isCorrect: questionForm.correct_answer === "A" ? 1 : 0,
        },
        {
            answer_text: questionForm?.answer_b,
            justification: questionForm.answer_b_justification,
            isCorrect: questionForm.correct_answer === "B" ? 1 : 0,
        },
        {
            answer_text: questionForm?.answer_c,
            justification: questionForm.answer_c_justification,
            isCorrect: questionForm.correct_answer === "C" ? 1 : 0,
        },
        {
            answer_text: questionForm?.answer_d,
            justification: questionForm.answer_d_justification,
            isCorrect: questionForm.correct_answer === "D" ? 1 : 0,
        },
    ]

    useEffect(() => {
        if (question) {
            setQuestionForm(question);
        }
    }, [question, exam]);

    useEffect(() => {
        const examIds = questionForm.exams?.map(exam => exam.exam_id).filter((id): id is number => id !== undefined) || [];

        // If examId prop is provided and not already in the form
        if (examId && !examIds.includes(examId)) {
            // Find the exam object from the exams list
            const examToAdd = exams.find(exam => exam.exam_id === examId);
            if (examToAdd) {
                // Add the exam to the form
                setQuestionForm(prev => ({
                    ...prev,
                    exams: [...(prev.exams || []), examToAdd]
                }));
                examIds.push(examId);
            }
        }

        setSelectedExams(examIds);
    }, [questionForm.exams, examId, exams]);

    useEffect(() => {
        const systemKaNums = questionForm.system_kas?.map(system_ka => system_ka.system_ka_number).filter((num): num is string => num !== undefined) || [];
        setSelectedSystemKas(systemKaNums);
    }, [questionForm.system_kas]);



    const handleChange = (key: string, value: unknown) => {
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
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

    const handleSubmit = () => {
        onSubmit(questionForm)
        setQuestionForm(defaultQuestion)
        setOpen(false);
    }

    const validateForm = () => {
        // Require question text
        if (!questionForm.question_text) { return false; }
        // Ensure exactly one answer is marked correct
        if (questionForm.correct_answer !== "A" &&
            questionForm.correct_answer !== "B" &&
            questionForm.correct_answer !== "C" &&
            questionForm.correct_answer !== "D") {
            return false;
        }
        // Ensure all answers have non-empty text
        if (!answers.every(a => a.answer_text && a.answer_text.trim() !== '')) { return false; }
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
                onSubmit={handleSubmit}
                onClose={() => setOpen(false)}
                validate={validateForm}
                maxWidth='lg'
                fullWidth={true}
            >
                <Box sx={containerSx}>
                    {/* Question Form Section */}
                    <Box>

                        <Box sx={{ pb: 2 }}>
                            <TextField
                                fullWidth
                                type={'text'}
                                value={questionForm.question_text || ''}
                                onChange={(e) => handleChange('question_text', e.target.value)}
                                label={"Question"}
                                required={true}
                                rows={5}
                                multiline={true}
                            />
                        </Box>
                        <Box sx={{ pb: 2 }}>
                            <TextField
                                fullWidth
                                type={'text'}
                                value={questionForm.technical_references || ''}
                                onChange={(e) => handleChange('technical_references', e.target.value)}
                                label={"Technical References"}
                                rows={2}
                                multiline={true}
                            />
                        </Box>
                        <Box sx={{ pb: 2 }}>
                            <TextField
                                fullWidth
                                type={'text'}
                                value={questionForm.references_provided || ''}
                                onChange={(e) => handleChange('references_provided', e.target.value)}
                                label={"References Provided"}
                                rows={2}
                                multiline={true}
                            />
                        </Box>
                        <Box sx={{ pb: 2 }}>
                            <TextField
                                fullWidth
                                type={'text'}
                                value={questionForm.objective || ''}
                                onChange={(e) => handleChange('objective', e.target.value)}
                                label={"Objective"}
                            />
                        </Box>

                        <Box sx={{ pb: 2 }} >
                            <TextField
                                fullWidth
                                type={'date'}
                                value={questionForm.last_used || ''}
                                onChange={(e) => handleChange('last_used', e.target.value)}
                                label={'Last Used'}
                                required={false}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        <Box sx={{ pb: 2, display: 'flex' }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl>
                                    <FormLabel id="exam-level-radio-group">Exam Level</FormLabel>
                                    <RadioGroup
                                        aria-labelledby="exam-level-radio-group"
                                        name="controlled-exam-level-radio-group"
                                        value={questionForm.exam_level || 0}
                                        onChange={(e) => handleChange('exam_level', e.target.value)}
                                    >
                                        <FormControlLabel value={0} control={<Radio />} label="RO" />
                                        <FormControlLabel value={1} control={<Radio />} label="SRO" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <FormControl>
                                    <FormLabel id="cognitive-level-radio-group">Cognitive Level</FormLabel>
                                    <RadioGroup
                                        aria-labelledby="cognitive-level-radio-group"
                                        name="controlled-cognitive-level-radio-group"
                                        value={questionForm.cognitive_level || 0}
                                        onChange={(e) => handleChange('cognitive_level', e.target.value)}
                                    >
                                        <FormControlLabel value={0} control={<Radio />} label="LOW" />
                                        <FormControlLabel value={1} control={<Radio />} label="HIGH" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                        </Box>

                        <Box sx={{ pb: 2 }} >
                            <CheckExams
                                examOptions={exams}
                                handleChange={handleExamCheckChange}
                                selectedIdList={selectedExams}
                            />
                        </Box>
                    </Box>

                    {/* Answers Section */}
                    <Box>
                        {answers.map((answer, idx) => {
                            const letter = String.fromCharCode(65 + idx); // 65 is 'A'
                            return (
                                <AnswerForm
                                    onChange={handleChange}
                                    answer={answer}
                                    letterChoice={letter}
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