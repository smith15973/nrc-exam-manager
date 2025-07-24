import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, TextFieldProps } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';

interface QuestionTextFieldWithValidationProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    touched: boolean;
    isQuestionTextValid: () => boolean | string;
    onDuplicateStatusChange?: (hasDuplicate: boolean, duplicateId?: string | number) => void;
    questionId?: number;
}

const QuestionTextFieldWithValidation: React.FC<QuestionTextFieldWithValidationProps & Omit<TextFieldProps, 'value' | 'onChange' | 'onBlur'>> = ({
    value,
    onChange,
    onBlur,
    touched,
    isQuestionTextValid,
    onDuplicateStatusChange,
    questionId,
    ...textFieldProps
}) => {
    const { getQuestionsComplete } = useDatabase();
    const [duplicateError, setDuplicateError] = useState<string>('');

    // Debounced duplicate check function
    const checkForDuplicate = useCallback(
        async (questionText: string): Promise<void> => {
            if (!questionText || questionText.trim() === '') {
                setDuplicateError('');
                return;
            }

            try {
                const existingQuestions: Question[] = await getQuestionsComplete({
                    question_text: questionText.trim()
                });

                if (existingQuestions && existingQuestions.length > 0) {
                    const duplicateId = existingQuestions[0].question_id;
                    // If questionId is provided and matches the duplicateId, it's an update, not a duplicate
                    if (questionId && duplicateId === questionId) {
                        setDuplicateError('');
                        onDuplicateStatusChange?.(false);
                    } else {
                        setDuplicateError(`Duplicate question found (ID: ${duplicateId})`);
                        onDuplicateStatusChange?.(true, duplicateId);
                    }
                } else {
                    setDuplicateError('');
                    onDuplicateStatusChange?.(false);
                }
            } catch (error) {
                console.error('Error checking for duplicate questions:', error);
                onDuplicateStatusChange?.(false); // Assume no duplicate on error
            }
        },
        [getQuestionsComplete]
    );

    // Debounce the duplicate check to avoid too many API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkForDuplicate(value);
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [value, checkForDuplicate]);

    // Determine if there's an error (either validation or duplicate)
    const hasValidationError = touched && !isQuestionTextValid();
    const hasDuplicateError = duplicateError !== '';
    const hasError = hasValidationError || hasDuplicateError;

    // Determine helper text priority: validation errors first, then duplicate errors
    const getHelperText = (): string => {
        if (hasValidationError) {
            return 'Question is required';
        }
        if (hasDuplicateError) {
            return duplicateError;
        }
        return '';
    };

    return (
        <Box>
            <Box sx={{ pb: 2 }}>
                <TextField
                    fullWidth
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    label="Question"
                    required={true}
                    rows={5}
                    multiline={true}
                    error={hasError}
                    helperText={getHelperText()}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: hasError ? 'error.main' : 'default',
                            },
                        },
                    }}
                    {...textFieldProps}
                />
            </Box>
        </Box>
    );
};

export default QuestionTextFieldWithValidation;