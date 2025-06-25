import { useState, useEffect } from 'react';
import { defaultKa } from '../../../data/db/schema';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { FormDialog } from '../../../common/components/FormDialog';
import StemSelect from '../../../features/stems/components/StemSelect';

interface KaFormProps {
    ka?: Ka;
    handleSubmit: (ka: Ka) => void;
}

export default function KaForm(props: KaFormProps) {
    const { ka, handleSubmit } = props;
    const [kaForm, setKaForm] = useState<Ka>(ka || defaultKa);
    const [open, setOpen] = useState(false);
    const { errors, stems } = useDatabase();

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

    const handleChange = (key: string, value: unknown) => {
        setKaForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(kaForm);
        setKaForm(defaultKa);
        handleClose();
    }

    const validateForm = () => {
        return !!kaForm.ka_number && !!kaForm.stem_id
    }

    const formContent = (
        <>
            {!ka ?
                <Box sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={kaForm.ka_number || ''}
                        onChange={(e) => handleChange('ka_number', e.target.value)}
                        label={"KA Number"}
                        required={true}
                    />
                </Box> : null}

            <Box sx={{ pt: 2 }}>
                <StemSelect handleChange={handleChange} stemId={kaForm.stem_id} stems={stems} />
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