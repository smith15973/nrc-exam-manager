
import ExamForm from '../components/ExamForm';
import ExamsList from '../components/ExamsList';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';


export default function ExamsPage() {
    const { exams, data } = useDatabase();
    const [error, setError] = useState<string | null>(null);
    const [examsList, setExamsList] = useState<Exam[]>([]);

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        const result = await data({ entity: 'exams', action: 'read' })
        if (result.success) {
            setExamsList(result.data);
        } else {
            setError(result.error || 'Failed to load exams');
        }
    }

    const handleSubmit = async (exam: Exam) => {
        const result = await data({ entity: 'exams', action: 'create', data: exam })
        if (result.success) {
            loadExams();
        }
    }
    const handleDeleteExam = async (id: number) => {
        const result = await exams.delete(id);
        if (result.success) {
            loadExams();
        } else {
            setError(result.error);
        }
    }

    return (
        <>
            <Typography variant='h4'>Exams</Typography>
            <ExamForm handleSubmit={handleSubmit} />
            <ExamsList exams={examsList} deleteExam={handleDeleteExam} />
            {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>}
        </>
    )
};