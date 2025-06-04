

import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import React, { useState } from 'react';


interface CheckExamsProps {
    selectedIdList: number[];
    examOptions: Exam[];
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckExams(props: CheckExamsProps) {
    const { selectedIdList, examOptions, handleChange } = props;
    const [open, setOpen] = useState(false);

    const isChecked = (examId: number) => {
        return selectedIdList.find(id => id === examId) ? true : false
    }

    const getDisplayText = () => {
        if (selectedIdList.length === 0) {
            return '';
        }

        const selectedNames = examOptions
            .filter(exam => selectedIdList.includes(exam.exam_id))
            .map(exam => exam.name)
            .join(', ');

        return selectedNames;
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                disableRestoreFocus
            >
                <DialogTitle>Selected Exams</DialogTitle>
                <DialogContent>

                    <FormControl sx={{ pb: 2 }} component="fieldset" variant='standard'>
                        <FormGroup>
                            {examOptions.map(examOption => {
                                return (
                                    <FormControlLabel
                                        key={examOption.exam_id}
                                        control={
                                            <Checkbox
                                                checked={isChecked(examOption.exam_id)}
                                                onChange={(e) => handleChange(e)}
                                                name={`${examOption.exam_id}`}
                                            />
                                        }
                                        label={examOption.name}
                                    />
                                )
                            })}
                        </FormGroup>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <TextField
                label="Exams"
                placeholder="Select Exams"
                value={getDisplayText()}
                onClick={() => setOpen(true)}
                InputProps={{
                    readOnly: true,
                    style: {
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }}
                sx={{
                    '& .MuiInputBase-input': {
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    },
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
                fullWidth
            />
        </>
    )
}