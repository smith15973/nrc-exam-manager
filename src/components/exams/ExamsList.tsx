// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface ExamListProps {
    exams: Exam[];
    deleteExam: (examId: number) => void;
}

export default function ExamsList(props: ExamListProps) {
    const { exams, deleteExam } = props
    return (
        <Box>
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
                        <ListItemAvatar>
                            <Avatar variant='rounded' alt={exam.name} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/exams/${exam.exam_id}`}>
                            {exam.exam_id} {exam.name}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};