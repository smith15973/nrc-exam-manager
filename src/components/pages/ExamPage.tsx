import { useEffect, useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Typography } from '@mui/material';
import { defaultExam } from '../lib/schema';
import { useParams } from 'react-router-dom';
import ExamForm from '../exams/ExamForm';


export default function ExamPage() {
    const [exam, setExam] = useState(defaultExam);
    const { examId } = useParams<{ examId: string }>();
    const { fetchExam, updateExam } = useDatabase();



    useEffect(() => {
        if (examId) {
            fetchExam(parseInt(examId)).then((fetchedExam) => {
                if (fetchedExam) {
                    setExam(fetchedExam);
                }
            });
        }
    }, []);

    const handleSubmit = async (updatedExam: Exam) => {
        try {
            const savedExam = await updateExam(updatedExam);
            if (savedExam) {
                setExam(savedExam);
            }
        } catch (err) {
            console.error("Failed to update exam:", err);
        }
    }

    return (
        <>
            <Typography variant='h4'>Hello {exam.name}</Typography>
            <ExamForm exam={exam} handleSubmit={handleSubmit} />


        </>
    )
};