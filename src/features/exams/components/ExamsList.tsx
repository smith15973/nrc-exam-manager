import { IconButton, ListItem, ListItemButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';
import ListWithSearch from '../../../common/components/ListWithSearch';


interface ExamListProps {
  exams: Exam[];
  deleteExam: (examId: number) => void;
}

export default function ExamsList({ exams, deleteExam }: ExamListProps) {

    // Render function for each item
    const renderExam = (exam: Exam, index: number, style: React.CSSProperties) => (
        <ListItem
            style={style}
            key={exam.exam_id}
            secondaryAction={
                <IconButton edge='end' aria-label='delete'>
                    <ConfirmDelete
                        message='Are you sure you want to delete this Exam? This action cannot be undone!'
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
                {exam.exam_id} {exam.name} - {exam.plant?.name}
            </ListItemButton>
        </ListItem>
    );

    // Search filter function
    const searchFilter = (exam: Exam, searchTerm: string) => {
        return `${exam.exam_id} ${exam.name} - ${exam.plant?.name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    };

    // Key function for stable list items
    const getItemKey = (exam: Exam) => exam.exam_id;

    return (
        <ListWithSearch
            data={exams}
            renderItem={renderExam}
            searchFilter={searchFilter}
            searchPlaceholder="Search Exams..."
            itemHeight={56}
            noResultsMessage="No Exams found"
            getItemKey={getItemKey}
        />
    );
}