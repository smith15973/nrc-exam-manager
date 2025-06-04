

import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import React, { useState } from 'react';


interface CheckSystemsProps {
    selectedIdList: string[];
    systemOptions: System[];
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckSystems(props: CheckSystemsProps) {
    const { selectedIdList, systemOptions, handleChange } = props;
    const [open, setOpen] = useState(false);

    const isChecked = (systemNum: string) => {
        return selectedIdList.find(id => id === systemNum) ? true : false
    }

    const getDisplayText = () => {
        if (selectedIdList.length === 0) {
            return '';
        }

        const selectedNames = systemOptions
            .filter(system => selectedIdList.includes(system.number))
            .map(system => `${system.number}-${system.name}`)
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
                <DialogTitle>Selected Systems</DialogTitle>
                <DialogContent>

                    <FormControl sx={{ pb: 2 }} component="fieldset" variant='standard'>
                        <FormGroup>
                            {systemOptions.map(systemOption => {
                                return (
                                    <FormControlLabel
                                        key={systemOption.number}
                                        control={
                                            <Checkbox
                                                checked={isChecked(systemOption.number)}
                                                onChange={(e) => handleChange(e)}
                                                name={`${systemOption.number}`}
                                            />
                                        }
                                        label={systemOption.name}
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
                label="Systems"
                placeholder="Select Systems"
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