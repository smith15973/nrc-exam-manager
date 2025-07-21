import { useEffect, useState } from 'react';
import { Box, TextField, Typography, Autocomplete } from '@mui/material';

interface ExamQuestionsFormProps {
    questionForm: Question;
    exams: Exam[];
    handleQuestionExamChange: (key: string, value: unknown, idx?: number) => void;
}

export default function ExamQuestionsForm({
    questionForm,
    exams,
    handleQuestionExamChange
}: ExamQuestionsFormProps) {
    const [examQuestionTouched, setExamQuestionTouched] = useState<Record<string, boolean>>({});
    // Individual field validation functions

    const isQuestionNumberValid = (qe: ExamQuestion) => {
        return qe.question_number >= 0;
    };

    const isPrimarySystemKaValid = (qe: ExamQuestion, questionForm: Question) => {
        if (!qe.main_system_ka_ka || !qe.main_system_ka_system) {
            return { valid: false, type: 'warning' as const };
        }

        const primarySystemKa = `${qe.main_system_ka_system}_${qe.main_system_ka_ka}`;
        const availableSystemKas = questionForm.system_kas?.map(sk => sk.system_ka_number) || [];

        if (!availableSystemKas.includes(primarySystemKa)) {
            return { valid: false, type: 'error' as const };
        }

        return { valid: true, type: 'success' as const };
    };

    const isKaMatchJustificationValid = (qe: ExamQuestion) => {
        return qe.ka_match_justification && qe.ka_match_justification.trim() !== '';
    };

    const isSroMatchJustificationValid = (qe: ExamQuestion, questionForm: Question) => {
        if (questionForm.exam_level !== 1) return true; // Not required for RO
        return qe.sro_match_justification && qe.sro_match_justification.trim() !== '';
    };

    const isAnswersOrderValid = (qe: ExamQuestion) => {
        return qe.answers_order && qe.answers_order.trim() !== '';
    };

    // Helper function to get border color based on validation state
    const getBorderColor = (isValid: boolean, isTouched: boolean, validationType: 'error' | 'warning' = 'warning') => {
        if (!isTouched) return 'default';
        if (!isValid) {
            return validationType === 'error' ? 'error.main' : '#ed6c02';
        }
        return 'default';
    };

    // Helper function to handle exam question field blur
    const handleExamQuestionBlur = (fieldName: string, examIndex: number) => {
        const key = `${fieldName}_${examIndex}`;
        setExamQuestionTouched(prev => ({ ...prev, [key]: true }));
    };

    // Helper function to check if exam question field is touched
    const isExamQuestionTouched = (fieldName: string, examIndex: number) => {
        const key = `${fieldName}_${examIndex}`;
        return examQuestionTouched[key] || false;
    };
    

    return (
        <Box>
            {/* Exam Questions */}
            {questionForm.question_exams && questionForm.question_exams.length > 0
                ? questionForm.question_exams.map((qe, idx) => {
                    const examName = exams.find(e => e.exam_id === qe.exam_id)?.name || 'Unknown';
                    const questionNumberValid = isQuestionNumberValid(qe);
                    const primarySystemKaValidation = isPrimarySystemKaValid(qe, questionForm);
                    const kaMatchJustificationValid = isKaMatchJustificationValid(qe);
                    const sroMatchJustificationValid = isSroMatchJustificationValid(qe, questionForm);
                    const answersOrderValid = isAnswersOrderValid(qe);

                    return (
                        <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                            <Typography variant='h6' sx={{ mb: 2 }}>{examName}</Typography>

                            {/* Question Number */}
                            <Box sx={{ display: 'flex' }}>
                                <TextField
                                    fullWidth
                                    type={'text'}
                                    value={qe.question_number || 0}
                                    onChange={(e) => handleQuestionExamChange('question_number', parseInt(e.target.value), idx)}
                                    onBlur={() => handleExamQuestionBlur('question_number', idx)}
                                    label={"Question Number (0 to Autogenerate)"}
                                    required={true}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: getBorderColor(
                                                    !!questionNumberValid,
                                                    isExamQuestionTouched('question_number', idx),
                                                    'warning'
                                                ),
                                            },
                                        },
                                        mb: 2
                                    }}
                                />
                            </Box>

                            {/* Primary System KA */}
                            <Autocomplete
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
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Primary System KA"
                                        error={
                                            isExamQuestionTouched('primary_system_ka', idx) &&
                                            !primarySystemKaValidation.valid
                                        }
                                        helperText={
                                            isExamQuestionTouched('primary_system_ka', idx) &&
                                                !primarySystemKaValidation.valid
                                                ? primarySystemKaValidation.type === 'error'
                                                    ? 'Primary System KA must match available System KAs'
                                                    : 'Primary System KA is required'
                                                : ''
                                        }
                                    />
                                )}
                                getOptionLabel={(option) => option || ''}
                                isOptionEqualToValue={(option, value) => option === value}
                                onBlur={() => handleExamQuestionBlur('primary_system_ka', idx)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: getBorderColor(
                                                primarySystemKaValidation.valid,
                                                isExamQuestionTouched('primary_system_ka', idx),
                                                primarySystemKaValidation.type === 'success' ? undefined : primarySystemKaValidation.type
                                            ),
                                        },
                                    },
                                    width: '100%',
                                    mb: 2
                                }}
                            />

                            {/* KA Match Justification */}
                            <TextField
                                fullWidth
                                type={'text'}
                                value={qe.ka_match_justification || ''}
                                onChange={(e) => handleQuestionExamChange('ka_match_justification', e.target.value, idx)}
                                onBlur={() => handleExamQuestionBlur('ka_match_justification', idx)}
                                label={"KA Match Justification"}
                                required={true}
                                rows={2}
                                multiline={true}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: getBorderColor(
                                                !!kaMatchJustificationValid,
                                                isExamQuestionTouched('ka_match_justification', idx),
                                                'warning'
                                            ),
                                        },
                                    },
                                    mb: 2
                                }}
                            />

                            {/* SRO Match Justification (only for SRO level) */}
                            {questionForm.exam_level === 1 && (
                                <TextField
                                    fullWidth
                                    type={'text'}
                                    value={qe.sro_match_justification || ''}
                                    onChange={(e) => handleQuestionExamChange('sro_match_justification', e.target.value, idx)}
                                    onBlur={() => handleExamQuestionBlur('sro_match_justification', idx)}
                                    label={"SRO Match Justification"}
                                    required
                                    rows={2}
                                    multiline={true}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: getBorderColor(
                                                    !!sroMatchJustificationValid,
                                                    isExamQuestionTouched('sro_match_justification', idx),
                                                    'warning'
                                                ),
                                            },
                                        },
                                        mb: 2
                                    }}
                                />
                            )}

                            {/* Answers Order */}
                            <Autocomplete
                                value={qe.answers_order || ''}
                                options={[
                                    "ABCD", "ABDC", "ACBD", "ACDB", "ADBC", "ADCB",
                                    "BACD", "BADC", "BCAD", "BCDA", "BDAC", "BDCA",
                                    "CABD", "CADB", "CBAD", "CBDA", "CDAB", "CDBA",
                                    "DABC", "DACB", "DBAC", "DBCA", "DCAB", "DCBA"
                                ]}
                                onChange={(_, newValue) => handleQuestionExamChange('answers_order', newValue, idx)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Answer Order"
                                    />
                                )}
                                getOptionLabel={(option) => option || ''}
                                isOptionEqualToValue={(option, value) => option === value}
                                onBlur={() => handleExamQuestionBlur('answers_order', idx)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: getBorderColor(
                                                !!answersOrderValid,
                                                isExamQuestionTouched('answers_order', idx),
                                                'warning'
                                            ),
                                        },
                                    },
                                    width: '100%'
                                }}
                            />
                        </Box>
                    );
                })
                : 'No Exams'
            }
        </Box>
    );
}