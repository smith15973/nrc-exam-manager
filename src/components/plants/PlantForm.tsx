// PlantForm.tsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { defaultPlant, plantSchema } from '../lib/schema';
import { Box, Button, TextField, Typography } from '@mui/material';

interface PlantFormProps {
    plantId?: number;
    addPlant: (plant: Plant) => void;
}

const PlantsForm: React.FC<PlantFormProps> = ({ plantId, addPlant }) => {
    const [plant, setPlant] = useState<Plant>(defaultPlant);
    const { fetchPlant } = useDatabase();

    useEffect(() => {
        if (plantId) {
            fetchPlant(plantId).then((fetchedPlant) => {
                if (fetchedPlant) {
                    setPlant(fetchedPlant);
                }
            });
        }
    }, [plantId, fetchPlant]);

    const handleChange = (key: string, value: string) => {
        setPlant((prev) => ({ ...prev, [key]: value }));
    }

    const handleSubmit = async () => {
        if (!plant.name.trim()) return;

        try {
            addPlant(plant);
            setPlant(defaultPlant);
        } catch (err) {
            // error handled by useDatabase hook
        }
    }

    return (
        <Box style={{ padding: '20px' }}>
            <Typography variant='h4'>Plant Management</Typography>
            {plantSchema.map((field) => (
                <Box key={field.key}>
                    <TextField type={field.type}
                        value={(plant as any)[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        label={`${field.label}`}
                        required={field.required}
                    />
                </Box>
            ))}
            <Button variant='contained' onClick={handleSubmit}>Add Plant</Button>
        </Box>
    );
};

export default PlantsForm;