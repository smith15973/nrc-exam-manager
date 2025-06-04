import React from 'react';
import MultiSelectDialog from '../../../common/components/MultiselectDialog';


interface CheckExamsProps {
    selectedIdList: number[];
    examOptions: Exam[];
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckExams(props: CheckExamsProps) {
    const config = {
        label: "Exams",
        placeholder: "Select Exams",
        dialogTitle: "Selected Exams",
        getKey: (exam: Exam) => exam.exam_id,
        getDisplayLabel: (exam: Exam) => exam.name,
        getDisplayText: (exam: Exam) => exam.name,
    };

    return (
        <MultiSelectDialog
            selectedIdList={props.selectedIdList}
            options={props.examOptions}
            config={config}
            handleChange={props.handleChange}
        />
    );
}