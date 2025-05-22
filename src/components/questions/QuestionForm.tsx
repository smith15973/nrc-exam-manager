import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema } from '../lib/schema';
import { Box, Button, TextField, SxProps } from '@mui/material';
import { useDatabase } from '../hooks/useDatabase';
import ExamSelect from '../exams/ExamSelect';
import AnswerForm from '../answers/AnswerForm';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    handleSubmit: (question: Question) => void;
    sx?: SxProps
}

export default function QuestionForm(props: QuestionFormProps) {
    const { question, handleSubmit, exam, sx } = props;
    const [questionForm, setQuestionForm] = useState<Question>(question || defaultQuestion);
    const { exams } = useDatabase();

    const options = ['A', 'B', 'C', 'D'];

    useEffect(() => {
        if (question) {
            setQuestionForm(question);
        }
    }, [question, exam]);

    const handleChange = (key: string, value: any) => {
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(questionForm)
        setQuestionForm(defaultQuestion)
    }

    return (
        <Box sx={sx}>
            {questionSchema.map((field) => {
                // Skip plant_id as we'll handle it separately with a Select
                if (field.key === 'plant_id') return null;

                return (
                    <Box sx={{ pb: '10px' }} key={field.key}>
                        <TextField
                            fullWidth
                            type={field.type}
                            value={(questionForm as any)[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            label={field.label}
                            required={field.required}
                        />
                    </Box>
                );
            })}
            <Box sx={{ pb: '10px' }}>
                {exam ? (
                    <TextField
                        fullWidth
                        type="text"
                        value={exam.name}
                        label="Plant"
                        disabled
                    />
                ) :
                    <ExamSelect handleChange={handleChange} exam_id={0} exams={exams} />
                }
            </Box>

            <Box>
                {options.map((option, idx) => {
                    const answer = questionForm.answers?.find(ans => ans.option === option);
                    return (
                        <AnswerForm answer={answer as Answer} key={option} option={option} />
                    )
                })}
            </Box>


            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!questionForm.question_text}
            >
                {question ? 'Update' : 'Add'} Question
            </Button>
        </Box>
    );
}