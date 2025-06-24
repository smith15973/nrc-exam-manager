// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete'



interface ExamListProps {
    exams: Exam[];
    deleteExam: (examId: number) => void;
}

export default function ExamsList(props: ExamListProps) {
    const { exams, deleteExam } = props
    return (
        <List>
            {exams.map((exam) => (
                <ListItem
                    key={exam.exam_id}
                    secondaryAction={
                        <IconButton edge='end' aria-label='delete'>
                            <ConfirmDelete
                                message='Are you sure you want to delete this exam? This action cannot be undone!'
                                onConfirmDelete={() => deleteExam(exam.exam_id)}
                                button={({ onClick, disabled }) => (
                                    <DeleteIcon
                                        onClick={onClick}
                                        style={{
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            opacity: disabled ? 0.5 : 1
                                        }}
                                    />
                                )}
                            />

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
}