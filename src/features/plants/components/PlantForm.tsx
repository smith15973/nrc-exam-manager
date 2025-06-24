import { useState, useEffect } from 'react';
import { defaultPlant, plantSchema } from '../../../data/db/schema';
import { Box, Button, TextField } from '@mui/material';
import { FormDialog } from '../../../common/components/FormDialog'


interface PlantFormProps {
    plant?: Plant;
    handleSubmit: (plant: Plant) => void;
}

export default function PlantForm({ plant, handleSubmit }: PlantFormProps) {
    const [plantForm, setPlantForm] = useState<Plant>(plant || defaultPlant);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (plant) {
            setPlantForm(plant);
        }
    }, [plant]);

    const handleChange = (key: string, value: string) => {
        setPlantForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(plantForm);
        setPlantForm(defaultPlant);
        setOpen(false);
    };

    const formContent = (
        <Box sx={{display: 'flex', justifyContent: 'space-evenly'}}>
            {plantSchema.map((field) => (
                <Box sx={{ pt: 2 }} key={field.key}>
                    <TextField
                        type={field.type}
                        value={plantForm[field.key as keyof typeof plantForm] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        label={field.label}
                        required={field.required}
                    />
                </Box>
            ))}
        </Box>
    );

    const validateForm = () => {
        return !!plantForm.name
    }

    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                {plant ? 'Edit' : 'Add'} Plant
            </Button>
            <FormDialog
                open={open}
                title={`${plant ? 'Edit' : 'Add'} Plant`}
                submitText={`${plant ? 'Update' : 'Add'} Plant`}
                onSubmit={onSubmit}
                onClose={() => setOpen(false)}
                validate={validateForm}
                maxWidth='xs'
                fullWidth={true}
            >
                {formContent}
            </FormDialog>
        </>
    );
}