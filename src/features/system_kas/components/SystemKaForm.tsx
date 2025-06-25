import { useState, useEffect } from 'react';
import { defaultSystemKa } from '../../../data/db/schema';
import { Alert, Box, Button, TextField } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import { FormDialog } from '../../../common/components/FormDialog';

import SystemSelect from '../../../features/systems/components/SystemSelect';
import KaSelect from '../../../features/kas/components/KaSelect';

interface SystemKaFormProps {
    system_ka?: SystemKa;
    handleSubmit: (system_ka: SystemKa) => void;
}

export default function SystemKaForm(props: SystemKaFormProps) {
    const { system_ka, handleSubmit } = props;
    const [system_kaForm, setSystemKaForm] = useState<SystemKa>(system_ka || defaultSystemKa);
    const [open, setOpen] = useState(false);
    const { errors, systems, kas } = useDatabase();

    useEffect(() => {
        if (system_ka) {
            setSystemKaForm(system_ka);
        }
    }, [system_ka]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key: string, value: unknown) => {
        setSystemKaForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(system_kaForm);
        setSystemKaForm(defaultSystemKa);
        handleClose();
    }

    const validateForm = () => {
        return !!system_kaForm.system_number && !!system_kaForm.ka_number
    }

    const formContent = (
        <>
            <Box sx={{ pt: 2 }}>
                <SystemSelect handleChange={handleChange} systemNumber={system_kaForm.system_number} systems={systems} />
            </Box>
            <Box sx={{ pt: 2 }}>
                <KaSelect handleChange={handleChange} kaNumber={system_kaForm.ka_number} kas={kas} />
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    type={'text'}
                    value={system_kaForm.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    label={"Category"}
                    required={true}
                />
                <Button
                    variant='contained'
                    onClick={() => handleChange('category', `${system_kaForm.ka?.stem?.stem_statement} - ${system_kaForm.system?.system_name}`)}
                >
                    Auto Generate
                </Button>
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    type={'number'}
                    value={system_kaForm.ro_importance || ''}
                    onChange={(e) => handleChange('ro_importance', parseFloat(e.target.value))}
                    label={"RO Importance"}
                    required={true}
                />
                <TextField
                    type={'number'}
                    value={system_kaForm.sro_importance || ''}
                    onChange={(e) => handleChange('sro_importance', parseFloat(e.target.value))}
                    label={"SRO Importance"}
                    required={true}
                />
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={system_kaForm.ka_statement || ''}
                    onChange={(e) => handleChange('ka_statement', e.target.value)}
                    label={"KA Statement"}
                    required={true}
                />
            </Box>
            <Box sx={{ pt: 2 }}>
                <TextField
                    fullWidth
                    type={'text'}
                    value={system_kaForm.cfr_content || ''}
                    onChange={(e) => handleChange('cfr_content', e.target.value)}
                    label={"CFR Content"}
                    required={true}
                />
            </Box>
        </>
    )


    return (
        <>
            <FormDialog
                open={open}
                title={`${system_ka ? 'Edit' : 'Add'} SystemKa`}
                submitText={`${system_ka ? 'Update' : 'Add'} SystemKa`}
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
                {system_ka ? 'Edit' : 'Add'} SystemKa
            </Button>

            {/* {errors.system_kas ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.system_kas}
                </Alert>
            ) : null} */}
        </>
    );
}