import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { defaultAnswer } from "../../../data/db/schema";


interface AnswerFormProps {
    answer: Answer;
    updateQuestionForm: (answer: Answer) => void
}

export default function AnswerForm(props: AnswerFormProps) {
    const { answer, updateQuestionForm } = props;

    const handleChange = (key: string, value: any) => {
        updateQuestionForm({ ...answer, [key]: value});
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 2 }}>
            <TextField
                sx={{ flex: 1 }}
                multiline
                rows={3}
                label={`Answer ${answer.option}`}
                value={answer.answer_text}
                onChange={(e) => handleChange("answer_text", e.currentTarget.value)}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={answer.is_correct === 1}
                        onChange={(e) => handleChange('is_correct', e.currentTarget.checked ? 1 : 0)}
                    />
                }
                label="Correct"
                sx={{ marginLeft: 2 }}
            />
        </Box>
    )
}