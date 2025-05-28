
import ExamForm from '../components/ExamForm';
import ExamsList from '../components/ExamsList';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';


export default function PlantsPage() {
    const { exams, addExam, deleteExam, error } = useDatabase();

    const handleSubmit = async (exam: Exam) => {
        await addExam(exam);
    }

    return (
        <>
            <Typography variant='h4'>Exams</Typography>
            <ExamForm handleSubmit={handleSubmit} />
            <ExamsList exams={exams} deleteExam={deleteExam} />
            {error && <Typography variant='body2' style={{ color: 'red' }}>{error}</Typography>}
        </>
    )
};