import * as React from 'react';
import { useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { useNavigate } from 'react-router-dom';
import { color } from '@mui/system';

interface DeleteError {
    id: string | null;
    error: string | null;
}

interface DeleteQuestionProps {
    questionId: number
}

function MyCustomDialog({ open, onClose, payload }: DialogProps<DeleteError>) {
    return (
        <Dialog disableRestoreFocus fullWidth open={open} onClose={() => onClose()}>
            <DialogTitle>Custom Error Handler</DialogTitle>
            <DialogContent>
                <Alert severity="error">
                    {`An error occurred while deleting item "${payload.id}":`}
                    <pre>{payload.error}</pre>
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Close me</Button>
            </DialogActions>
        </Dialog>
    );
}


export default function DeleteQuestion(props: DeleteQuestionProps) {
    const { questionId } = props;
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { deleteQuestion } = useDatabase();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const handleDelete = async (id: number) => {
        if (id) {
            const deleteConfirmed = await dialogs.confirm(
                `Are you sure you want to delete this question? This will remove it from all exam associations! This action cannot be undone!`,
            );
            if (deleteConfirmed) {
                try {
                    setIsDeleting(true);
                    await deleteQuestion(id);
                    dialogs.alert('Deleted!');
                    navigate(`/questions`);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    await dialogs.open(MyCustomDialog, { id: String(id), error: message });
                } finally {
                    setIsDeleting(false);
                }
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
                <Button
                    variant="contained"
                    color="error"
                    loading={isDeleting}
                    onClick={() => handleDelete(questionId)}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
