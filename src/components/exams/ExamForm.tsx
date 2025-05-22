import { useState, useEffect } from 'react';
import { defaultExam, examSchema } from '../lib/schema';
import { Box, Button, MenuItem, Select, TextField, FormControl, InputLabel, FormHelperText, SxProps } from '@mui/material';
import { useDatabase } from '../hooks/useDatabase';
import PlantSelect from '../plants/PlantSelect';

interface ExamFormProps {
    exam?: Exam;
    plant?: Plant;
    handleSubmit: (exam: Exam) => void;
    sx?: SxProps
}

export default function ExamForm(props: ExamFormProps) {
    const { exam, handleSubmit, plant, sx } = props;
    const [examForm, setExamForm] = useState<Exam>(exam || defaultExam);
    const { plants } = useDatabase();

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
        handleSubmit(examForm)
        setExamForm(defaultExam)
    }

    return (
        <Box sx={sx}>
            {examSchema.map((field) => {
                // Skip plant_id as we'll handle it separately with a Select
                if (field.key === 'plant_id') return null;

                return (
                    <Box sx={{ pb: '10px' }} key={field.key}>
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

            <Box sx={{ pb: '10px' }}>
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


            <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!examForm.name || examForm.plant_id === 0}
            >
                {exam ? 'Update' : 'Add'} Exam
            </Button>
        </Box>
    );
}