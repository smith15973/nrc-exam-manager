// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface ExamListProps {
    exams: Exam[];
    deleteExam: (examId: number) => void;
    sx?: SxProps;
}

export default function ExamsList(props: ExamListProps) {
    const { exams, deleteExam, sx } = props
    return (
        <List>
            {exams.map((exam) => (
                <ListItem
                    key={exam.exam_id}
                    secondaryAction={
                        <IconButton edge='end' aria-label='delete'>
                            <DeleteIcon onClick={() => deleteExam(exam.exam_id!)} />
                        </IconButton>
                    }
                    divider
                    disablePadding
                >
                    <ListItemButton component={Link} to={`/exams/${exam.exam_id}`}>
                        {exam.exam_id} {exam.name} {exam.plant?.name}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>

    );
};