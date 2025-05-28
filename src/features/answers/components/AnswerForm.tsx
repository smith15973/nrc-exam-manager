import { Box, FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { defaultAnswer } from "../../../data/db/schema";


interface AnswerFormProps {
    answer: Answer;
    updateQuestionForm: (answer: Answer) => void
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, updateQuestionForm } = props;
    const [answerForm, setAnswerForm] = useState<Answer>(answer || defaultAnswer);

    useEffect(() => {
        if (answer && JSON.stringify(answer) !== JSON.stringify(answerForm)) {
            setAnswerForm(answer);
        }
    }, [answer]);

    const handleChange = (key: string, value: any) => {
        setAnswerForm((prev) => ({ ...prev, [key]: value }));
    }

    useEffect(() => {
        updateQuestionForm(answerForm);
    }, [answerForm]);

    return (
        <Box >
            <FormGroup sx={{ display: 'flex' }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label={`Answer ${answerForm.option}`}
                    value={answerForm.answer_text}
                    onChange={(e) => handleChange("answer_text", e.currentTarget.value)}
                />


                <FormControlLabel
                    control={
                        <Switch checked={answerForm.is_correct === 1} onChange={(e) => handleChange('is_correct', e.currentTarget.checked ? 1 : 0)} />
                    }
                    label="Correct"
                />
            </FormGroup>
        </Box>
    )
}