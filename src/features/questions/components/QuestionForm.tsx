import { useState, useEffect, useMemo } from 'react';
import { defaultQuestion } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import AnswersForm from './AnswersForm';
import { FormDialog } from '../../../common/components/FormDialog';
import SystemKaSelect from '../../../features/system_kas/components/SystemKaSelect';
import ExamQuestionSelect from '../../exams/components/ExamQuestionSelect';
import SystemKaForm from '../../../features/system_kas/components/SystemKaForm';
import ExamQuestionsForm from '../../../features/examsQuestions/components/ExamQuestionsForm';
import QuestionTextFieldWithValidation from './QuestionTextFieldWithValidation';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    onSubmit: (question: Question) => void;
    examId?: number;
}

interface QuestionFormContentProps {
    questionForm: Question;
    selectedSystemKas: string[];
    handleChange: (key: string, value: unknown) => void;
    handleQuestionExamChange: (key: string, value: unknown, idx?: number) => void;
    answers: [Answer, Answer, Answer, Answer];
    validationState?: (validationResult: { state: string; message: string }) => void;
}

export function QuestionFormContent({
    questionForm,
    selectedSystemKas,
    handleChange,
    handleQuestionExamChange,
    answers,
    validationState = () => { return },
}: QuestionFormContentProps) {
    const { exams, system_kas, addSystemKa } = useDatabase();
    // Validation state
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        validationState(getValidationState());
    }, [questionForm, answers]);

    // Individual validation functions for question exams
    const isExamQuestionValid = (qe: ExamQuestion, questionForm: Question, examName: string) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for Primary System KA
        if (!qe.main_system_ka_ka || !qe.main_system_ka_system) {
            warnings.push(`Missing Primary System KA number for exam '${examName}'`);
        } else {
            // Check if Primary System KA matches available System KAs
            const primarySystemKa = `${qe.main_system_ka_system}_${qe.main_system_ka_ka}`;
            const availableSystemKas = questionForm.system_kas?.map(sk => sk.system_ka_number) || [];
            if (!availableSystemKas.includes(primarySystemKa)) {
                errors.push(`Primary System KA number does not match available System KA numbers for exam '${examName}'`);
            }
        }

        // Check for KA match justification
        if (!qe.ka_match_justification || qe.ka_match_justification.trim() === '') {
            warnings.push(`Missing KA match justification for exam '${examName}'`);
        }

        // Check for SRO match justification if exam level is SRO
        if (questionForm.exam_level === 1 && (!qe.sro_match_justification || qe.sro_match_justification.trim() === '')) {
            warnings.push(`Missing SRO match justification for exam '${examName}'`);
        }

        // Check for answers order
        if (!qe.answers_order || qe.answers_order.trim() === '') {
            warnings.push(`Missing answers order for exam '${examName}'`);
        }

        return { errors, warnings };
    };

    // Updated comprehensive validation function
    const getExamQuestionsValidationDetails = () => {
        // If no exams, return warning
        if ((questionForm.question_exams?.length ?? 0) === 0) {
            return { status: 'warning', message: 'No exams associated with this question' };
        }

        const allErrors: string[] = [];
        const allWarnings: string[] = [];

        // Check each exam question for issues
        for (const qe of questionForm.question_exams || []) {
            const examName = exams.find(e => e.exam_id === qe.exam_id)?.name || 'Unknown';
            const { errors, warnings } = isExamQuestionValid(qe, questionForm, examName);

            allErrors.push(...errors);
            allWarnings.push(...warnings);
        }

        if (allErrors.length > 0) {
            return { status: 'error', message: allErrors[0] }; // Return first error
        }

        if (allWarnings.length > 0) {
            return { status: 'warning', message: allWarnings[0] }; // Return first warning
        }

        return { status: 'success', message: 'All exam questions are valid' };
    };

    // In your parent component, add state to track duplicate status:
    const [hasDuplicateQuestion, setHasDuplicateQuestion] = useState(false);
    const [duplicateQuestionId, setDuplicateQuestionId] = useState<string | number | undefined>();

    const handleDuplicateStatusChange = (hasDuplicate: boolean, duplicateId?: string | number) => {
        setHasDuplicateQuestion(hasDuplicate);
        setDuplicateQuestionId(duplicateId);
    };

    // Original validation functions
    const isQuestionTextValid = () => {
        return questionForm.question_text && questionForm.question_text.trim() !== '';
    };

    const isTechReferencesValid = () => {
        return questionForm.technical_references && questionForm.technical_references.trim() !== '';
    };

    const isReferencesProvidedValid = () => {
        return questionForm.references_provided && questionForm.references_provided.trim() !== '';
    };

    const isObjectiveValid = () => {
        return questionForm.objective && questionForm.objective.trim() !== '';
    };

    const isCorrectAnswerValid = () => {
        return questionForm.correct_answer === "A" ||
            questionForm.correct_answer === "B" ||
            questionForm.correct_answer === "C" ||
            questionForm.correct_answer === "D";
    };

    const areAnswersValid = () => {
        return answers.every(a => a.answer_text && a.answer_text.trim() !== '');
    };

    const areAnswerJustificationsValid = () => {
        return answers.every(a => a.justification && a.justification.trim() !== '');
    };

    const areSystemKasValid = () => {
        return (questionForm.system_kas?.length ?? 0) > 0;
    };

    const getValidationState = () => {
        const optionalFieldsValid = isTechReferencesValid() && isReferencesProvidedValid() && isObjectiveValid();
        const examQuestionsDetails = getExamQuestionsValidationDetails();

        // Check for errors first (blocking validation)
        if (!isQuestionTextValid()) {
            return { state: 'error', message: 'Question text is required.' };
        }
        if (hasDuplicateQuestion) {
            return { state: 'error', message: `Duplicate question found (ID: ${duplicateQuestionId})` };
        }
        if (!isCorrectAnswerValid()) {
            return { state: 'error', message: 'A valid correct answer (A–D) is required.' };
        }
        if (!areAnswersValid()) {
            return { state: 'error', message: 'All answers must have text.' };
        }
        if (!areAnswerJustificationsValid()) {
            return { state: 'error', message: 'All answer justifications must have text.' };
        }

        // Check for exam questions errors
        if (examQuestionsDetails.status === 'error') {
            return { state: 'error', message: examQuestionsDetails.message };
        }

        // Check for warnings (non-blocking validation)
        if (!areSystemKasValid()) {
            return { state: 'warning', message: 'Question has no System KAs associated.' };
        }
        if (examQuestionsDetails.status === 'warning') {
            return { state: 'warning', message: examQuestionsDetails.message };
        }
        if (!optionalFieldsValid) {
            return { state: 'warning', message: 'Some optional fields (references or objective) are incomplete.' };
        }

        return { state: 'success', message: 'All fields are valid.' };
    };

    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

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

    const handleSystemKaSubmit = async (system_ka: SystemKa) => {
        await addSystemKa(system_ka);
    }

    return (
        <Box sx={containerSx}>
            {/* Question Form Section */}
            <Box>
                <QuestionTextFieldWithValidation
                    value={questionForm.question_text}
                    onChange={(e) => handleChange('question_text', e.target.value)}
                    onBlur={() => handleFieldBlur('question_text')}
                    touched={touched.question_text}
                    isQuestionTextValid={isQuestionTextValid}
                    onDuplicateStatusChange={handleDuplicateStatusChange}
                />
                <Box sx={{ pb: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={questionForm.technical_references || ''}
                        onChange={(e) => handleChange('technical_references', e.target.value)}
                        onBlur={() => handleFieldBlur('technical_references')}
                        label={"Technical References"}
                        rows={2}
                        multiline={true}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: touched.technical_references && !isTechReferencesValid() ? '#ed6c02' : 'default',
                                },
                            },
                        }}
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
                        onBlur={() => handleFieldBlur('references_provided')}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: touched.references_provided && !isReferencesProvidedValid() ? '#ed6c02' : 'default',
                                },
                            },
                        }}
                    />
                </Box>
                <Box sx={{ pb: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={questionForm.objective || ''}
                        onChange={(e) => handleChange('objective', e.target.value)}
                        onBlur={() => handleFieldBlur('objective')}
                        label={"Objective"}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: touched.objective && !isObjectiveValid() ? '#ed6c02' : 'default',
                                },
                            },
                        }}
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
                <Box sx={{ pb: 2, display: 'flex' }} >
                    <Box sx={{ width: '75%' }}>
                        <SystemKaSelect
                            system_kas={system_kas}
                            handleChange={handleChange}
                            selectedIdList={selectedSystemKas}
                        />
                    </Box>
                    <Box>
                        <SystemKaForm handleSubmit={handleSystemKaSubmit} />
                    </Box>
                </Box>
                <Box sx={{ pb: 2 }} >
                    <ExamQuestionSelect
                        exams={exams}
                        handleChange={handleQuestionExamChange}
                        selectedList={questionForm.question_exams || []}
                    />

                    <ExamQuestionsForm questionForm={questionForm} exams={exams} handleQuestionExamChange={handleQuestionExamChange} />


                </Box>
            </Box>

            {/* Answers Section */}
            <Box>
                <AnswersForm
                    onChange={handleChange}
                    answers={answers}
                />
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
    const [validationStatus, setValidationStatus] = useState<{ state: string; message: string }>({
        state: 'error',
        message: 'Form incomplete',
    });

    // FIXED: Memoize the answers array to prevent infinite re-renders
    const answers: [Answer, Answer, Answer, Answer] = useMemo(() => [
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
    ], [
        questionForm?.answer_a,
        questionForm?.answer_b,
        questionForm?.answer_c,
        questionForm?.answer_d,
        questionForm.answer_a_justification,
        questionForm.answer_b_justification,
        questionForm.answer_c_justification,
        questionForm.answer_d_justification,
        questionForm.correct_answer
    ]);

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
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
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

    return (
        <>
            <FormDialog
                open={open}
                title={`${question ? 'Edit' : 'Add'} Question`}
                submitText={`${question ? 'Update' : 'Add'} Question`}
                onSubmit={handleSubmit}
                onClose={() => setOpen(false)}
                validate={() => validationStatus.state !== 'error'}
                maxWidth='lg'
                fullWidth={true}
            >
                <QuestionFormContent
                    questionForm={questionForm}
                    selectedSystemKas={selectedSystemKas}
                    handleChange={handleChange}
                    handleQuestionExamChange={handleQuestionExamChange}
                    answers={answers}
                    validationState={setValidationStatus}
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