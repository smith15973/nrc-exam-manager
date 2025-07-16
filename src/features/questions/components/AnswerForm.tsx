import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import { useState } from "react";

interface AnswerFormProps {
    answer: Answer;
    onChange: (key: string, value: unknown) => void;
    letterChoice: string;
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, onChange, letterChoice } = props;
    
    // Track which fields have been touched (blurred)
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validation functions
    const isAnswerTextValid = () => {
        return answer.answer_text && answer.answer_text.trim() !== '';
    };

    const isJustificationValid = () => {
        return answer.justification && answer.justification.trim() !== '';
    };

    const handleChange = (key: string, value: unknown) => {
        key = key.replace('$', letterChoice.toLowerCase());
        onChange(key, value);
    };

    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 2 }}>
            <Box sx={{ flex: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Answer ${letterChoice}`}
                    value={answer.answer_text || ''}
                    onChange={(e) => handleChange("answer_$", e.target.value)}
                    onBlur={() => handleFieldBlur('answer_text')}
                    required={true}
                    error={touched.answer_text && !isAnswerTextValid()}
                    helperText={touched.answer_text && !isAnswerTextValid() ? 'Answer text is required' : ''}
                    sx={{
                        pb: 1,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: touched.answer_text && !isAnswerTextValid() ? 'error.main' : 'default',
                            },
                        },
                    }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Justification ${letterChoice}`}
                    value={answer.justification || ''}
                    onChange={(e) => handleChange("answer_$_justification", e.target.value)}
                    onBlur={() => handleFieldBlur('justification')}
                    error={touched.justification && !isJustificationValid()}
                    helperText={touched.justification && !isJustificationValid() ? 'Justification is required' : ''}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: touched.justification && !isJustificationValid() ? 'error.main' : 'default',
                            },
                        },
                    }}
                />
            </Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={answer.isCorrect === 1}
                        onChange={(e) => e.target.checked ? handleChange('correct_answer', letterChoice) : ''}
                    />
                }
                label="Correct"
                sx={{ marginLeft: 2 }}
            />
        </Box>
    );
}