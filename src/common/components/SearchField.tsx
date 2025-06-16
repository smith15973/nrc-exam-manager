import React from 'react';
import { TextField, InputAdornment, IconButton, TextFieldProps } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

interface SearchFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value?: string;
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  value = '',
  onChange,
  placeholder = 'Search',
  fullWidth = true,
  sx = { mb: 2 },
  disabled = false,
  size = 'medium',
  variant = 'outlined',
  onClear,
  showClearButton = true,
  ...otherProps
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      // Create a synthetic event for consistency
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange('', syntheticEvent);
    }
  };

  return (
    <TextField
      placeholder={placeholder}
      fullWidth={fullWidth}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      size={size}
      variant={variant}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: value && showClearButton && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              size="small"
              disabled={disabled}
              aria-label="Clear search"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        )
      }}
      sx={sx}
      {...otherProps}
    />
  );
};

export default SearchField;