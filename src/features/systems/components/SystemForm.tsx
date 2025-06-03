import { useState, useEffect, use } from 'react';
import { defaultSystem, systemSchema } from '../../../data/db/schema';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import PlantSelect from '../../plants/components/PlantSelect';
import { FormDialog } from '../../../common/components/FormDialog';

interface SystemFormProps {
    system?: System;
    handleSubmit: (system: System) => void;
}

export default function SystemForm(props: SystemFormProps) {
    const { system, handleSubmit } = props;
    const [systemForm, setSystemForm] = useState<System>(system || defaultSystem);
    const [open, setOpen] = useState(false);
    const { errors } = useDatabase();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key: string, value: any) => {
        setSystemForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(systemForm);
        setSystemForm(defaultSystem);
        handleClose();
    }

    const validateForm = () => {
        return !systemForm.name || !systemForm.number
    }

    const formContent = (
        <>
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={(systemForm as any)['number'] || ''}
                    onChange={(e) => handleChange('number', e.target.value)}
                    label={"System Number"}
                    required={true}
                />
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={(systemForm as any)['name'] || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
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

            {errors.systems ? (
            <Alert severity="error" sx={{ mb: 2 }}>
                {errors.systems}
            </Alert>
            ) : null}
        </>
    );
}