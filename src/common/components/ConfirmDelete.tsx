import * as React from 'react';
import { useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useDatabase } from '../hooks/useDatabase';
import { useNavigate } from 'react-router-dom';
import { color } from '@mui/system';

interface DeleteQuestionProps {
    onConfirmDelete: () => void
    message: string;
    redirectPath?: string
}


export default function ConfirmDelete(props: DeleteQuestionProps) {
    const { onConfirmDelete, message, redirectPath } = props;
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { deleteQuestion } = useDatabase();
    const dialogs = useDialogs();
    const navigate = useNavigate();

    const handleDelete = async () => {
        const deleteConfirmed = await dialogs.confirm(
            message
        );
        if (deleteConfirmed) {
            try {
                setIsDeleting(true);
                onConfirmDelete();
                if (redirectPath) {
                    navigate(redirectPath);
                }

            } catch (error) {
                dialogs.alert("Oops, an error occured!", error)
            } finally {
                setIsDeleting(false);
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
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}
