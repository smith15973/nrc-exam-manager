
import ExamForm from '../components/ExamForm';
import ExamsList from '../components/ExamsList';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { Typography } from '@mui/material';


export default function ExamsPage() {
    const { exams, addExam, deleteExam} = useDatabase();

    const handleSubmit = async (exam: Exam) => {
        await addExam(exam);
    }

    return (
        <>
            <Typography variant='h4'>Exams</Typography>
            <ExamForm handleSubmit={handleSubmit} />
            <ExamsList exams={exams} deleteExam={deleteExam} />
        </>
    )
}