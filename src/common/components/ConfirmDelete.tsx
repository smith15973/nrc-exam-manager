import * as React from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';


interface DeleteQuestionProps {
    onConfirmDelete: () => void
    message: string;
    redirectPath?: string
    button?: React.ComponentType<{ onClick: () => void; disabled: boolean }>;
    buttonText?: string;
    disabled?: boolean | false;
}


export default function ConfirmDelete(props: DeleteQuestionProps) {
    const { onConfirmDelete, message, redirectPath, button: CustomButton, disabled, buttonText } = props;
    const [isDeleting, setIsDeleting] = React.useState(false);
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
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    return (
        <>
            {CustomButton ? (
                <CustomButton onClick={handleDelete} disabled={isDeleting} />
            ) : (
                <Button
                    variant="contained"
                    color="error"
                    disabled={isDeleting || disabled}
                    onClick={handleDelete}
                >
                    {buttonText || "Delete"}
                </Button>
            )}
        </>
    );
}
