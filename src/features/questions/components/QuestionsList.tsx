// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface QuestionListProps {
    questions: Question[];
    deleteQuestion: (questionId: number) => void;
}

export default function QuestionsList(props: QuestionListProps) {
    const { questions, deleteQuestion} = props
    return (
        <List>
            {questions.map((question) => (
                <ListItem
                    key={question.question_id}
                    secondaryAction={
                        <IconButton edge='end' aria-label='delete'>
                            <DeleteIcon onClick={() => deleteQuestion(question.question_id)} />
                        </IconButton>
                    }
                    divider
                    disablePadding
                >
                    <ListItemButton component={Link} to={`/questions/${question.question_id}`}>
                        {question.question_id} {question.question_text}
                    </ListItemButton>
                </ListItem>
            ))}
        </List>

    );
}