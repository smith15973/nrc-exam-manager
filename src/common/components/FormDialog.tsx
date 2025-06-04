import { ReactNode } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle } from '@mui/material';

interface FormDialogProps {
    open: boolean;
    title: string;
    submitText: string;
    onSubmit: () => void;
    onClose: () => void;
    children: ReactNode;
    validate?: () => boolean;
    maxWidth?: DialogProps['maxWidth'];
    fullWidth?: boolean;
}

export function FormDialog(props: FormDialogProps) {
    const { open, title, submitText, onSubmit, onClose, children, validate, fullWidth, maxWidth } = props;

    return (
        <Dialog
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            open={open}
            onClose={onClose}
            disableRestoreFocus
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={validate ? !validate() : false} onClick={onSubmit}>{submitText}</Button>
            </DialogActions>
        </Dialog>
    );
}