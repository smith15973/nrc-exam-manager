// PlantForm.tsx
import { useState, useEffect } from 'react';
import { defaultPlant, plantSchema } from '../lib/schema';
import { Box, Button, TextField } from '@mui/material';

interface PlantFormProps {
    plant?: Plant;
    handleSubmit: (plant: Plant) => void;
}

export default function PlantForm(props: PlantFormProps) {
    const { plant, handleSubmit } = props;
    const [plantForm, setPlantForm] = useState<Plant>(defaultPlant);

    useEffect(() => {
        if (plant) {
            setPlantForm(plant);
        }
    }, [plant]);

    const handleChange = (key: string, value: string) => {
        setPlantForm((prev) => ({ ...prev, [key]: value }));
    }


    return (
        <Box>
            {plantSchema.map((field) => (
                <Box sx={{ pb: '10px' }} key={field.key}>
                    <TextField
                        type={field.type}
                        value={(plantForm as any)[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        label={`${field.label}`}
                        required={field.required}
                    />
                </Box>
            ))}
            <Button
                variant='contained'
                onClick={() => handleSubmit(plantForm)}
                disabled={!plantForm.name}
            >
                {plant ? 'Update' : 'Add'} Plant
            </Button>
        </Box>
    );
};

