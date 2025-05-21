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
    }, [examId]);

    const handleSubmit = async (updatedExam: Exam) => {
        try {
            console.log("Updated", updatedExam)
            const savedExam = await updateExam(updatedExam);
            if (savedExam) {
                setExam(updatedExam);
            }
        } catch (err) {
            console.error("Failed to update exam:", err);
        }
    }

    return (
        <>
            <Typography variant='h4'>{exam.name} - {exam.plant?.name}</Typography>
            <ExamForm exam={exam} handleSubmit={handleSubmit} />
            <p>{JSON.stringify(exam)}</p>


        </>
    )
};