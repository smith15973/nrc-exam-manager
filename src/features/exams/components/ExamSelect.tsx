
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface ExamSelectProps {
    exam_id: number;
    exams: Exam[];
    handleChange: (idx: number, value: number) => void
    idx: number;
}

export default function ExamSelect(props: ExamSelectProps) {
    const { exam_id, exams, handleChange, idx } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="exam-select-label">Exam</InputLabel>
            <Select
                labelId="exam-select-label"
                id="exam-select"
                value={exam_id}
                label="Exam"
                onChange={(e) => handleChange(idx, Number(e.target.value))}
            >
                <MenuItem value={0}>Select an Exam</MenuItem>
                {exams.map((exam: Exam) => (
                    <MenuItem key={exam.exam_id} value={exam.exam_id}>
                        {exam.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}