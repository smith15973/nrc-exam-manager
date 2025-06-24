import { Box, FormControlLabel, Switch, TextField } from "@mui/material";


interface AnswerFormProps {
    answer: Answer
    updateQuestionForm: (answer: Answer) => void
    letterChoice: string;
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, updateQuestionForm, letterChoice } = props;

    const handleChange = (key: string, value: any) => {
        updateQuestionForm({ ...answer, [key]: value });
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
                    onChange={(e) => handleChange("answer_text", e.currentTarget.value)}
                    sx={{ pb: 1 }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Justifcation ${letterChoice}`}
                    value={answer.justification || ''}
                    onChange={(e) => handleChange("justification", e.currentTarget.value)}
                />
            </Box>
            <FormControlLabel
                control={
                    <Switch
                        checked={answer.isCorrect === 1}
                        onChange={(e) => handleChange('is_correct', e.currentTarget.checked ? 1 : 0)}
                    />
                }
                label="Correct"
                sx={{ marginLeft: 2 }}
            />
        </Box>
    )
}