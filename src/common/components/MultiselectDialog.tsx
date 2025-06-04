import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import React, { useState } from 'react';

interface MultiSelectConfig<T, K> {
  label: string;
  placeholder: string;
  dialogTitle: string;
  getKey: (item: T) => K;
  getDisplayLabel: (item: T) => string;
  getDisplayText: (item: T) => string;
}

interface MultiSelectProps<T, K> {
  selectedIdList: K[];
  options: T[];
  config: MultiSelectConfig<T, K>;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MultiSelectDialog<T, K extends string | number>(props: MultiSelectProps<T, K>) {
  const { selectedIdList, options, config, handleChange } = props;
  const [open, setOpen] = useState(false);

  const isChecked = (key: K) => {
    return selectedIdList.includes(key);
  };

  const getDisplayText = () => {
    if (selectedIdList.length === 0) {
      return '';
    }
    
    const selectedNames = options
      .filter(item => selectedIdList.includes(config.getKey(item)))
      .map(item => config.getDisplayText(item))
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
        <DialogTitle>{config.dialogTitle}</DialogTitle>
        <DialogContent>
          <FormControl sx={{ pb: 2 }} component="fieldset" variant='standard'>
            <FormGroup>
              {options.map(option => {
                const key = config.getKey(option);
                return (
                  <FormControlLabel
                    key={String(key)}
                    control={
                      <Checkbox
                        checked={isChecked(key)}
                        onChange={(e) => handleChange(e)}
                        name={String(key)}
                      />
                    }
                    label={config.getDisplayLabel(option)}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <TextField
        label={config.label}
        placeholder={config.placeholder}
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
  );
}