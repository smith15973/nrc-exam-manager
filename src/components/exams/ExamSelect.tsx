
import { MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';

interface ExamSelectProps {
    exam_id: number;
    exams: Exam[];
    handleChange: (key: string, value: number) => void
}

export default function ExamSelect(props: ExamSelectProps) {
    const { exam_id, exams, handleChange } = props;

    return (
        <FormControl fullWidth required>
            <InputLabel id="exam-select-label">Exam</InputLabel>
            <Select
                labelId="exam-select-label"
                id="exam-select"
                value={exam_id}
                label="Exam"
                onChange={(e) => handleChange('exam_id', e.target.value)}
            >
                <MenuItem value={0}>Select an Exam</MenuItem>
                {exams.map((exam: Exam) => (
                    <MenuItem key={exam.exam_id} value={exam.exam_id}>
                        {exam.name}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>Select an exam for this question</FormHelperText>
        </FormControl>
    )
}