import { useState, useEffect } from 'react';
import { defaultExam, examSchema } from '../../../data/db/schema';
import { Box, Button, TextField } from '@mui/material';
import { useDatabase } from '../../../common/hooks/useDatabase';
import PlantSelect from '../../plants/components/PlantSelect';
import { FormDialog } from '../../../common/components/FormDialog';

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

    const validateForm = () => {
        return !!examForm.name && examForm.plant_id !== 0
    }

    const formContent = (
        <>
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
        </>
    )


    return (
        <>
            <FormDialog
                open={open}
                title={`${exam ? 'Edit' : 'Add'} Exam`}
                submitText={`${exam ? 'Update' : 'Add'} Exam`}
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
                {exam ? 'Edit' : 'Add'} Exam
            </Button>
        </>
    );
}