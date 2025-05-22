import { Box, FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";

interface AnswerFormProps {
    answer: Answer
    option: string;
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, option } = props;

    return (
        <Box >
            <FormGroup sx={{ display: 'flex' }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Answer ${option}`}
                    value={answer.answer_text}
                />


                <FormControlLabel
                    control={
                        <Switch value={answer.is_correct} />
                    }
                    label="Correct"
                />
            </FormGroup>
        </Box>
    )
}