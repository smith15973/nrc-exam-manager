// PlantForm.tsx
import { useState, useEffect } from 'react';
import { defaultPlant, plantSchema } from '../../../data/db/schema';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, SxProps, TextField } from '@mui/material';

interface PlantFormProps {
    plant?: Plant;
    handleSubmit: (plant: Plant) => void;
}

export default function PlantForm(props: PlantFormProps) {
    const { plant, handleSubmit } = props;
    const [plantForm, setPlantForm] = useState<Plant>(defaultPlant);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    useEffect(() => {
        if (plant) {
            setPlantForm(plant);
        }
    }, [plant]);

    const handleChange = (key: string, value: string) => {
        setPlantForm((prev) => ({ ...prev, [key]: value }));
    }

    const onSubmit = () => {
        handleSubmit(plantForm)
        setPlantForm(defaultPlant)
        handleClose();
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose} disableRestoreFocus>
                <DialogTitle>{plant ? 'Update' : 'Add'} Plant</DialogTitle>
                <DialogContent>
                    {plantSchema.map((field) => (
                        <Box sx={{ pt: 2 }} key={field.key}>
                            <TextField
                                type={field.type}
                                value={(plantForm as any)[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                label={`${field.label}`}
                                required={field.required}
                            />
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        disabled={!plantForm.name || plant == plantForm}
                        onClick={onSubmit}
                    >
                        {plant ? 'Update' : 'Add'} Plant
                    </Button>
                </DialogActions>
            </Dialog>

            <Button
                variant='contained'
                onClick={handleClickOpen}
            >
                {plant ? 'Update' : 'Add'} Plant
            </Button>
        </>
    );
};

