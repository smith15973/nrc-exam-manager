import { useState, useEffect } from 'react';
import { defaultQuestion, questionSchema, defaultAnswer, defaultExam } from '../db/schema';
import { Box, Button, TextField, SxProps } from '@mui/material';
import { useDatabase } from '../hooks/useDatabase';
import AnswerForm from '../answers/AnswerForm';
import MultiExamSelect from '../exams/MultiExamSelect';
import ErrorPopup from '../common/ErrorPopup';

interface QuestionFormProps {
    question?: Question;
    exam?: Exam;
    handleSubmit: (question: Question) => void;
    sx?: SxProps
}

export default function QuestionForm(props: QuestionFormProps) {
    const { question, handleSubmit, exam, sx } = props;
    const [questionForm, setQuestionForm] = useState<Question>(question || defaultQuestion);
    const [questionExams, setQuestionExams] = useState<number[]>([])
    const { exams } = useDatabase();

    useEffect(() => {
        if (question) {
            setQuestionForm(question);
        }
    }, [question, exam]);


    useEffect(() => {
        const examIds = questionForm.exams?.map(exam => exam.exam_id).filter((id): id is number => id !== undefined) || [];
        setQuestionExams(examIds);
    }, [questionForm])


    const handleChange = (key: string, value: any) => {
        setQuestionForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAnswerChange = (newAnswer: Answer) => {
        setQuestionForm((prev) => {
            // Ensure answers is always a 4-element tuple
            let answers: [Answer, Answer, Answer, Answer];
            if (prev.answers && prev.answers.length === 4) {
                answers = [...prev.answers] as [Answer, Answer, Answer, Answer];
            } else {
                answers = [defaultAnswer, defaultAnswer, defaultAnswer, defaultAnswer]
            }
            const index = answers.findIndex((ans) => ans.option === newAnswer.option);
            if (index !== -1) {
                answers[index] = { ...newAnswer };
            }
            return { ...prev, answers };
        });
    };

    const handleExamsChange = (newExamList: number[]) => {
        setQuestionExams(newExamList);

        // Sync with questionForm.exams
        const selectedExams = exams.filter(exam => newExamList.includes(exam.exam_id));
        setQuestionForm(prev => ({
            ...prev,
            exams: selectedExams
        }));
    }

    const handleAddExamClick = () => {
        setQuestionForm(prev => ({
            ...prev,
            exams: [...(prev.exams || []), defaultExam]
        }));
    }

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
                    <Box sx={{ pb: 2 }} key={field.key}>
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

            <MultiExamSelect
                examList={questionExams}
                examOptions={exams}
                handleAddExamClick={handleAddExamClick}
                onExamsUpdate={handleExamsChange}
            />

            <Box>
                {questionForm.answers?.map((answer, idx) => {
                    return (
                        <AnswerForm updateQuestionForm={handleAnswerChange} answer={answer} key={idx} />
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

            <ErrorPopup />
        </Box>
    );
}