import { useState, useEffect } from 'react';
import { defaultExam, examSchema } from '../../../data/db/schema';
import { Box, Button, TextField, SxProps } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import PlantSelect from '../../plants/components/PlantSelect';

interface ExamFormProps {
    exam?: Exam;
    plant?: Plant;
    handleSubmit: (exam: Exam) => void;
    sx?: SxProps
}

export default function ExamForm(props: ExamFormProps) {
    const { exam, handleSubmit, plant, sx } = props;
    const [examForm, setExamForm] = useState<Exam>(exam || defaultExam);
    const [plantList, setPlantList] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { plants, data } = useDatabase();

    useEffect(() => {
        if (exam) {
            setExamForm(exam);
        } else if (plant) {
            setExamForm((prev) => ({ ...prev, plant_id: plant.plant_id }));
        }
    }, [exam, plant]);

    const loadPlants = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await data({ entity: 'plants', action: 'read' });
            if (result.success) {
                setPlantList(result.data || []);
            } else {
                setError(result.error || 'Failed to load plants');
            }
        } catch (err) {
            setError('Error loading plants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                    <PlantSelect handleChange={handleChange} plant_id={examForm.plant_id} plants={plantList} />
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