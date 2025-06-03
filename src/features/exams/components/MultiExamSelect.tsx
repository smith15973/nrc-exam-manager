

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import ExamSelect from './ExamSelect';


interface MultiExamSelectProps {
    examList: number[];
    examOptions: Exam[];
    handleAddExamClick: () => void;
    onExamsUpdate: (newExamList: number[]) => void;
}

export default function MultiExamSelect(props: MultiExamSelectProps) {
    const { examList, examOptions, handleAddExamClick, onExamsUpdate } = props;

    const handleExamSelectChange = (idx: number, value: number) => {
        const updatedExamList = [...examList];
        updatedExamList[idx] = value;
        onExamsUpdate(updatedExamList);
    }



    return (
        <Box sx={{ pb: 2 }}>
            {examList?.map((examId, idx) => {
                return (
                    <ExamSelect key={idx} handleChange={handleExamSelectChange} exam_id={examId} exams={examOptions} idx={idx} />
                )
            })}
            <Button onClick={handleAddExamClick}>+ Add Exam</Button>
        </Box>
    )
}