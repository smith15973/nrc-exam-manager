import { useState, useEffect, use } from 'react';
import { defaultKa } from '../../../data/db/schema';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { FormDialog } from '../../../common/components/FormDialog';

interface KaFormProps {
    ka?: Ka;
    handleSubmit: (ka: Ka) => void;
}

export default function KaForm(props: KaFormProps) {
    const { ka, handleSubmit } = props;
    const [kaForm, setKaForm] = useState<Ka>(ka || defaultKa);
    const [open, setOpen] = useState(false);
    const { errors } = useDatabase();

    useEffect(() => {
        if (ka) {
            setKaForm(ka);
        }
    }, [ka]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key: string, value: any) => {
        setKaForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(kaForm);
        setKaForm(defaultKa);
        handleClose();
    }

    const validateForm = () => {
        return !!kaForm.ka_number && !!kaForm.category_number
    }

    const formContent = (
        <>
            {!ka ?
                <Box sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={(kaForm as any)['ka_number'] || ''}
                        onChange={(e) => handleChange('ka_number', e.target.value)}
                        label={"KA Number"}
                        required={true}
                    />
                </Box> : null}
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={(kaForm as any)['category_number'] || ''}
                    onChange={(e) => handleChange('category_number', e.target.value)}
                    label={"Category Number"}
                    required={true}
                />
            </Box>
        </>
    )


    return (
        <>
            <FormDialog
                open={open}
                title={`${ka ? 'Edit' : 'Add'} Ka`}
                submitText={`${ka ? 'Update' : 'Add'} Ka`}
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
                {ka ? 'Edit' : 'Add'} Ka
            </Button>

            {errors.kas ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.kas}
                </Alert>
            ) : null}
        </>
    );
}