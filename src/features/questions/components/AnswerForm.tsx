import { Box, FormControlLabel, Switch, TextField } from "@mui/material";


interface AnswerFormProps {
    answer: Answer
    onChange: (key: string, value: any) => void
    letterChoice: string;
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, onChange, letterChoice } = props;

    const handleChange = (key: string, value: any) => {
        key = key.replace('$', letterChoice.toLowerCase());
        onChange(key, value);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 2 }}>
            <Box sx={{ flex: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Answer ${letterChoice}`}
                    value={answer.answer_text}
                    onChange={(e) => handleChange("answer_$", e.target.value)}
                    sx={{ pb: 1 }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Justification ${letterChoice}`}
                    value={answer.justification || ''}
                    onChange={(e) => handleChange("answer_$_justification", e.target.value)}
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
    )
}