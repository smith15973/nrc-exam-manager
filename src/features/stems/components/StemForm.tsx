import { useState, useEffect } from 'react';
import { defaultStem } from '../../../data/db/schema';
import { Box, Button, TextField } from '@mui/material';
import { FormDialog } from '../../../common/components/FormDialog';

interface StemFormProps {
    stem?: Stem;
    handleSubmit: (stem: Stem) => void;
}

export default function StemForm(props: StemFormProps) {
    const { stem, handleSubmit } = props;
    const [stemForm, setStemForm] = useState<Stem>(stem || defaultStem);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (stem) {
            setStemForm(stem);
        }
    }, [stem]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key: string, value: unknown) => {
        setStemForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(stemForm);
        setStemForm(defaultStem);
        handleClose();
    }

    const validateForm = () => {
        return !!stemForm.stem_id && !!stemForm.stem_statement
    }

    const formContent = (
        <>
            {!stem ?
                <Box sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        type={'text'}
                        value={stemForm.stem_id || ''}
                        onChange={(e) => handleChange('stem_id', e.target.value)}
                        label={"Stem ID"}
                        required={true}
                    />
                </Box> : null}
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={stemForm.stem_statement || ''}
                    onChange={(e) => handleChange('stem_statement', e.target.value)}
                    label={"Stem Statement"}
                    required={true}
                />
            </Box>
        </>
    )


    return (
        <>
            <FormDialog
                open={open}
                title={`${stem ? 'Edit' : 'Add'} Stem`}
                submitText={`${stem ? 'Update' : 'Add'} Stem`}
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
                {stem ? 'Edit' : 'Add'} Stem
            </Button>
        </>
    );
}