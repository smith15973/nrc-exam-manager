import { useState, useEffect } from 'react';
import { defaultExam, examSchema } from '../../../data/db/schema';
import { Box, Button, MenuItem, Select, TextField, FormControl, InputLabel, FormHelperText, SxProps, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import PlantSelect from '../../plants/components/PlantSelect';

interface ExamFormProps {
    exam?: Exam;
    plant?: Plant;
    handleSubmit: (exam: Exam) => void;
}

export default function ExamForm(props: ExamFormProps) {
    const { exam, handleSubmit, plant } = props;
    const [examForm, setExamForm] = useState<Exam>(exam || defaultExam);
    const { plants } = useDatabase();
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (exam) {
            setExamForm(exam);
        } else if (plant) {
            setExamForm((prev) => ({ ...prev, plant_id: plant.plant_id }));
        }
    }, [exam, plant]);

    const handleChange = (key: string, value: any) => {
        setExamForm((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
        handleSubmit(examForm);
        setExamForm(defaultExam);
        handleClose();
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose} disableRestoreFocus>
                <DialogTitle>{exam ? 'Update' : 'Add'} Exam</DialogTitle>
                <DialogContent>
                    {examSchema.map((field) => {
                        // Skip plant_id as we'll handle it separately with a Select
                        if (field.key === 'plant_id') return null;

                        return (
                            <Box sx={{ pt: 2 }} key={field.key}>
                                <TextField
                                    fullWidth
                                    type={field.type}
                                    value={(examForm as any)[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    label={field.label}
                                    required={field.required}
                                />
                            </Box>
                        );
                    })}

                    <Box sx={{ pt: 2 }}>
                        {plant ? (
                            <TextField
                                fullWidth
                                type="text"
                                value={plant.name}
                                label="Plant"
                                disabled
                            />
                        ) :
                            <PlantSelect handleChange={handleChange} plant_id={examForm.plant_id} plants={plants} />
                        }
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        disabled={!examForm.name || examForm.plant_id === 0}
                        onClick={onSubmit}
                    >
                        {exam ? 'Update' : 'Add'} Exam
                    </Button>
                </DialogActions>
            </Dialog>

            <Button
                variant='contained'
                onClick={handleClickOpen}
            >
                {exam ? 'Update' : 'Add'} Exam
            </Button>
        </>
    );
}