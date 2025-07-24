import { useState, useEffect } from 'react';
import { defaultSystem} from '../../../data/db/schema';
import { Box, Button, TextField } from '@mui/material';
import { FormDialog } from '../../../common/components/FormDialog';

interface SystemFormProps {
    system?: System;
    handleSubmit: (system: System) => void;
}

export default function SystemForm(props: SystemFormProps) {
    const { system, handleSubmit } = props;
    const [systemForm, setSystemForm] = useState<System>(system || defaultSystem);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (system) {
            setSystemForm(system);
        }
    }, [system]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key: string, value: unknown) => {
        setSystemForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(systemForm);
        setSystemForm(defaultSystem);
        handleClose();
    }

    const validateForm = () => {
        return !!systemForm.system_name && !!systemForm.system_number
    }

    const formContent = (
        <>
            {!system ?
                <Box sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={systemForm.system_number || ''}
                        onChange={(e) => handleChange('system_number', e.target.value)}
                        label={"System Number"}
                        required={true}
                    />
                </Box> : null}
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={systemForm.system_name || ''}
                    onChange={(e) => handleChange('system_name', e.target.value)}
                    label={"System Name"}
                    required={true}
                />
            </Box>
        </>
    )


    return (
        <>
            <FormDialog
                open={open}
                title={`${system ? 'Edit' : 'Add'} System`}
                submitText={`${system ? 'Update' : 'Add'} System`}
                onSubmit={onSubmit}
                onClose={handleClose}
                validate={validateForm}
                maxWidth='md'
                fullWidth={true}
            >
                {formContent}
            </FormDialog>

            <Button
                variant='contained'
                onClick={handleClickOpen}
            >
                {system ? 'Edit' : 'Add'} System
            </Button>
        </>
    );
}