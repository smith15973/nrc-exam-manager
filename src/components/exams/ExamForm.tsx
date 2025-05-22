import { useState, useEffect } from 'react';
import { defaultExam, examSchema } from '../lib/schema';
import { Box, Button, MenuItem, Select, TextField, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useDatabase } from '../hooks/useDatabase';

interface ExamFormProps {
    exam?: Exam;
    handleSubmit: (exam: Exam) => void;
}

export default function ExamForm(props: ExamFormProps) {
    const { exam, handleSubmit } = props;
    const [examForm, setExamForm] = useState<Exam>(exam || defaultExam);
    const { plants } = useDatabase();

    useEffect(() => {
        if (exam) {
            setExamForm(exam);
        }
    }, [exam]);

    const handleChange = (key: string, value: any) => {
        setExamForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Box>
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

            {/* Plant selection dropdown */}
            <Box sx={{ pb: '10px' }}>
                <FormControl fullWidth required>
                    <InputLabel id="plant-select-label">Plant</InputLabel>
                    <Select
                        labelId="plant-select-label"
                        id="plant-select"
                        value={examForm.plant_id}
                        label="Plant"
                        onChange={(e) => handleChange('plant_id', e.target.value)}
                    >
                        <MenuItem value={0}>Select a Plant</MenuItem>
                        {plants.map((plant: Plant) => (
                            <MenuItem key={plant.plant_id} value={plant.plant_id}>
                                {plant.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>Select the plant for this exam</FormHelperText>
                </FormControl>
            </Box>

            <Button
                variant="contained"
                onClick={() => handleSubmit(examForm)}
                disabled={!examForm.name || examForm.plant_id === 0}
            >
                {exam ? 'Update' : 'Add'} Exam
            </Button>
        </Box>
    );
}