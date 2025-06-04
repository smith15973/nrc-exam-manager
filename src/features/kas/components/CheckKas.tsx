

import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import React, { useState } from 'react';


interface CheckKasProps {
    selectedIdList: string[];
    kaOptions: Ka[];
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckKas(props: CheckKasProps) {
    const { selectedIdList, kaOptions, handleChange } = props;
    const [open, setOpen] = useState(false);

    const isChecked = (kaNum: string) => {
        return selectedIdList.find(id => id === kaNum) ? true : false
    }

    const getDisplayText = () => {
        if (selectedIdList.length === 0) {
            return '';
        }

        const selectedNames = kaOptions
            .filter(ka => selectedIdList.includes(ka.ka_number))
            .map(ka => `${ka.ka_number}-${ka.ka_description}`)
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
                <DialogTitle>Selected Kas</DialogTitle>
                <DialogContent>

                    <FormControl sx={{ pb: 2 }} component="fieldset" variant='standard'>
                        <FormGroup>
                            {kaOptions.map(kaOption => {
                                return (
                                    <FormControlLabel
                                        key={kaOption.ka_number}
                                        control={
                                            <Checkbox
                                                checked={isChecked(kaOption.ka_number)}
                                                onChange={(e) => handleChange(e)}
                                                name={`${kaOption.ka_number}`}
                                            />
                                        }
                                        label={kaOption.ka_description}
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
                label="Kas"
                placeholder="Select Kas"
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