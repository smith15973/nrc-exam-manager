import { useState, useEffect } from 'react';
import { defaultQuestion } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Typography, Autocomplete } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswerForm from './AnswerForm';
import { FormDialog } from '../../../common/components/FormDialog';
import SystemKaSelect from '../../../features/system_kas/components/SystemKaSelect';
import ExamQuestionSelect from '../../exams/components/ExamQuestionSelect';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    onSubmit: (question: Question) => void;
    examId?: number;
}

interface QuestionFormContentProps {
    questionForm: Question;
    // setQuestionForm: React.Dispatch<React.SetStateAction<Question>>;
    selectedSystemKas: string[];
    // setSelectedSystemKas: React.Dispatch<React.SetStateAction<string[]>>;
    handleChange: (key: string, value: unknown) => void;
    handleQuestionExamChange: (key: string, value: unknown, idx?: number) => void;
    answers: [Answer, Answer, Answer, Answer];
}

export function QuestionFormContent({
    questionForm,
    // setQuestionForm,
    selectedSystemKas,
    // setSelectedSystemKas,
    handleChange,
    handleQuestionExamChange,
    answers
}: QuestionFormContentProps) {
    const { exams, system_kas } = useDatabase();

    // Responsive container styles
    const containerSx: SxProps = {
        pt: 2,
        display: 'grid',
        gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: '1fr 1fr',
        },
        gap: 2,
        '@media (max-width: 900px)': {
            gridTemplateColumns: '1fr',
        }
    };

    return (
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
                                onChange={(e) => handleChange('exam_level', parseInt(e.target.value))}
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
                    <SystemKaSelect
                        system_kas={system_kas}
                        handleChange={handleChange}
                        selectedIdList={selectedSystemKas}
                    />
                </Box>
                <Box sx={{ pb: 2 }} >
                    <ExamQuestionSelect
                        exams={exams}
                        handleChange={handleQuestionExamChange}
                        selectedList={questionForm.question_exams || []}
                    />
                    {questionForm.question_exams && questionForm.question_exams.length > 0
                        ? questionForm.question_exams.map((qe, idx) => (
                            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                <Typography variant='h6'>{qe.exam?.name}</Typography>
                                <Autocomplete
                                    sx={{ width: '100%', mb: 2 }}
                                    value={
                                        qe.main_system_ka_system && qe.main_system_ka_ka
                                            ? `${qe.main_system_ka_system}_${qe.main_system_ka_ka}`
                                            : ''
                                    }
                                    options={
                                        (questionForm.system_kas?.map(sk => sk.system_ka_number) || [])
                                    }
                                    onChange={(_, newValue) => {
                                        const [system, ka] = (newValue || '').split('_');
                                        handleQuestionExamChange('main_system_ka_system', system, idx);
                                        handleQuestionExamChange('main_system_ka_ka', ka, idx);
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Primary System KA" />}
                                    getOptionLabel={(option) => option || ''}
                                    isOptionEqualToValue={(option, value) => option === value}
                                />
                                <TextField
                                    fullWidth
                                    type={'text'}
                                    value={qe.ka_match_justification || ''}
                                    onChange={(e) => handleQuestionExamChange('ka_match_justification', e.target.value, idx)}
                                    label={"KA Match Justification"}
                                    required={true}
                                    rows={2}
                                    multiline={true}
                                    sx={{ mb: 2 }}
                                />
                                {questionForm.exam_level === 1 && (
                                    <TextField
                                        fullWidth
                                        type={'text'}
                                        value={qe.sro_match_justification || ''}
                                        onChange={(e) => handleQuestionExamChange('sro_match_justification', e.target.value, idx)}
                                        label={"SRO Match Justification"}
                                        required
                                        rows={2}
                                        multiline={true}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                                <Autocomplete
                                    sx={{ width: '100%' }}
                                    value={qe.answers_order || ''}
                                    options={[
                                        "ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB",
                                        "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA",
                                        "CABD", "CADB", "CBAD", "CBDA", "CDAB", "CDBA",
                                        "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA"
                                    ]}
                                    onChange={(_, newValue) => handleQuestionExamChange('answers_order', newValue, idx)}
                                    renderInput={(params) => <TextField {...params} label="Answer Order" />}
                                    getOptionLabel={(option) => option || ''}
                                    isOptionEqualToValue={(option, value) => option === value}
                                />
                            </Box>
                        ))
                        : 'No Exams'}
                </Box>
            </Box>
            {/* Answers Section */}
            <Box>
                {answers.map((answer, idx) => {
                    const letter = String.fromCharCode(65 + idx);
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
    );
}

export default function QuestionFormModal(props: QuestionFormProps) {
    const { question, onSubmit, exam, examId } = props;
    const [questionForm, setQuestionForm] = useState<Question>(question || defaultQuestion);
    const [selectedSystemKas, setSelectedSystemKas] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const { exams } = useDatabase();

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
    ];

    useEffect(() => {
        if (question) {
            setQuestionForm(question);
        }
    }, [question, exam]);

    useEffect(() => {
        const examIds = questionForm.question_exams?.map(question_exam => question_exam.exam_id).filter((id): id is number => id !== undefined) || [];
        if (examId && !examIds.includes(examId)) {
            const examToAdd = exams.find(exam => exam.exam_id === examId);
            if (examToAdd) {
                setQuestionForm(prev => ({
                    ...prev,
                    question_exams: [
                        ...(prev.question_exams || []),
                        {
                            exam: examToAdd,
                            question_id: 0,
                            exam_id: examToAdd.exam_id,
                            question_number: 0,
                            main_system_ka_system: null,
                            main_system_ka_ka: null,
                            ka_match_justification: '',
                            sro_match_justification: '',
                            answers_order: '',
                        }
                    ]
                }));
            }
        }
    }, [questionForm.question_exams, examId, exams]);

    useEffect(() => {
        const systemKaNums = questionForm.system_kas?.map(system_ka => system_ka.system_ka_number).filter((num): num is string => num !== undefined) || [];
        setSelectedSystemKas(systemKaNums);
    }, [questionForm.system_kas]);

    const handleChange = (key: string, value: unknown) => {
        console.log(key, value);
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
        console.log(questionForm);
    };

    const handleQuestionExamChange = (key: string, value: unknown, idx?: number) => {
        if (key === "question_exams" && Array.isArray(value)) {
            setQuestionForm(prev => ({
                ...prev,
                question_exams: value as ExamQuestion[]
            }));
        } else if (typeof idx === 'number') {
            setQuestionForm(prev => ({
                ...prev,
                question_exams: prev.question_exams?.map((qe, i) =>
                    i === idx ? { ...qe, [key]: value } : qe
                ) || []
            }));
        }
    };

    const handleSubmit = () => {
        onSubmit(questionForm);
        setQuestionForm(defaultQuestion);
        setOpen(false);
    };

    const validateForm = () => {
        if (!questionForm.question_text) { return false; }
        if (questionForm.correct_answer !== "A" &&
            questionForm.correct_answer !== "B" &&
            questionForm.correct_answer !== "C" &&
            questionForm.correct_answer !== "D") {
            return false;
        }
        if (!answers.every(a => a.answer_text && a.answer_text.trim() !== '')) { return false; }
        return true;
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
                <QuestionFormContent
                    questionForm={questionForm}
                    selectedSystemKas={selectedSystemKas}
                    handleChange={handleChange}
                    handleQuestionExamChange={handleQuestionExamChange}
                    answers={answers}
                />
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