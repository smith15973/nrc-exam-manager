import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    TextField,
    Box,
    Chip,
    Typography,
    Divider,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    ListItemText,
    Switch
} from '@mui/material';
import { Search, FilterList, Clear, Check, Close } from '@mui/icons-material';
import React, { useState, useMemo } from 'react';

interface MultiSelectConfig<T, K> {
    label: string;
    placeholder: string;
    dialogTitle: string;
    getKey: (item: T) => K;
    getDisplayLabel: (item: T) => string;
    getDisplayText: (item: T) => string;
    // New filtering configuration
    getSearchableFields?: (item: T) => string[]; // Multiple fields to search
    getFilterableProps?: (item: T) => Record<string, any>; // Properties for advanced filtering
    sortOptions?: Array<{
        label: string;
        getValue: (item: T) => any;
        direction?: 'asc' | 'desc';
    }>;
}

interface FilterState {
    searchQuery: string;
    selectedOnly: boolean;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    propertyFilters: Record<string, any>;
}

interface MultiSelectProps<T, K> {
    selectedIdList: K[];
    options: T[];
    config: MultiSelectConfig<T, K>;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    maxDisplayItems?: number;
    enableAdvancedFiltering?: boolean;
}

export default function MultiSelectDialog<T, K extends string | number>(props: MultiSelectProps<T, K>) {
    const {
        selectedIdList,
        options,
        config,
        handleChange,
        maxDisplayItems = 3,
        enableAdvancedFiltering = false
    } = props;

    const [open, setOpen] = useState(false);
    const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

    const [filterState, setFilterState] = useState<FilterState>({
        searchQuery: '',
        selectedOnly: false,
        sortBy: '',
        sortDirection: 'asc',
        propertyFilters: {}
    });

    const isChecked = (key: K) => {
        return selectedIdList.includes(key);
    };

    // Enhanced search function
    const matchesSearch = (option: T, query: string): boolean => {
        if (!query.trim()) return true;

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

        // Get searchable fields
        const searchableFields = config.getSearchableFields
            ? config.getSearchableFields(option)
            : [config.getDisplayText(option), config.getDisplayLabel(option)];

        const searchableText = searchableFields.join(' ').toLowerCase();

        // Support for multiple search modes
        if (query.startsWith('"') && query.endsWith('"')) {
            // Exact phrase search
            const phrase = query.slice(1, -1).toLowerCase();
            return searchableText.includes(phrase);
        } else if (query.includes('AND') || query.includes('&')) {
            // AND search - all terms must match
            const andTerms = query.toLowerCase().split(/\s+(?:and|&)\s+/);
            return andTerms.every(term => searchableText.includes(term.trim()));
        } else if (query.includes('OR') || query.includes('|')) {
            // OR search - any term must match
            const orTerms = query.toLowerCase().split(/\s+(?:or|\|)\s+/);
            return orTerms.some(term => searchableText.includes(term.trim()));
        } else {
            // Default fuzzy search - all terms should match
            return searchTerms.every(term => searchableText.includes(term));
        }
    };

    // Advanced filtering logic
    const filteredOptions = useMemo(() => {
        let filtered = options.filter(option => {
            // Search filter
            if (!matchesSearch(option, filterState.searchQuery)) {
                return false;
            }

            // Selected only filter
            if (filterState.selectedOnly) {
                const key = config.getKey(option);
                if (!selectedIdList.includes(key)) {
                    return false;
                }
            }

            // Property filters
            if (config.getFilterableProps && Object.keys(filterState.propertyFilters).length > 0) {
                const props = config.getFilterableProps(option);
                for (const [propKey, filterValue] of Object.entries(filterState.propertyFilters)) {
                    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                        if (props[propKey] !== filterValue) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });

        // Sorting
        if (filterState.sortBy && config.sortOptions) {
            const sortOption = config.sortOptions.find(opt => opt.label === filterState.sortBy);
            if (sortOption) {
                filtered.sort((a, b) => {
                    const aVal = sortOption.getValue(a);
                    const bVal = sortOption.getValue(b);
                    const multiplier = filterState.sortDirection === 'asc' ? 1 : -1;

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return aVal.localeCompare(bVal) * multiplier;
                    }

                    if (aVal < bVal) return -1 * multiplier;
                    if (aVal > bVal) return 1 * multiplier;
                    return 0;
                });
            }
        }

        return filtered;
    }, [options, filterState, selectedIdList, config]);

    const getDisplayText = () => {
        if (selectedIdList.length === 0) {
            return '';
        }

        const selectedNames = options
            .filter(item => selectedIdList.includes(config.getKey(item)))
            .map(item => config.getDisplayText(item));

        if (selectedNames.length <= maxDisplayItems) {
            return selectedNames.join(', ');
        }

        return `${selectedNames.slice(0, maxDisplayItems).join(', ')} +${selectedNames.length - maxDisplayItems} more`;
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilterState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearAllFilters = () => {
        setFilterState({
            searchQuery: '',
            selectedOnly: false,
            sortBy: '',
            sortDirection: 'asc',
            propertyFilters: {}
        });
    };

    const hasActiveFilters = () => {
        return filterState.searchQuery !== '' ||
            filterState.selectedOnly ||
            filterState.sortBy !== '' ||
            Object.keys(filterState.propertyFilters).length > 0;
    };

    // Get unique property values for filtering
    const getUniquePropertyValues = (propKey: string) => {
        if (!config.getFilterableProps) return [];

        const values = options.map(option => {
            const props = config.getFilterableProps!(option);
            return props[propKey];
        }).filter((value, index, self) =>
            value !== null && value !== undefined && self.indexOf(value) === index
        );

        return values.sort();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                disableRestoreFocus
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        {config.dialogTitle}
                        <Box>
                            {hasActiveFilters() && (
                                <IconButton onClick={clearAllFilters} size="small">
                                    <Clear />
                                </IconButton>
                            )}
                            {enableAdvancedFiltering && (
                                <IconButton
                                    onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                                    size="small"
                                >
                                    <FilterList />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    {/* Search Bar */}
                    <TextField
                        placeholder='Search (use "quotes" for exact match, AND/OR for boolean search)'
                        fullWidth
                        value={filterState.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                            endAdornment: filterState.searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleFilterChange('searchQuery', '')}
                                        size="small"
                                    >
                                        <Clear />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* Quick Filters */}
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip
                            label={`Selected Only (${selectedIdList.length})`}
                            color={filterState.selectedOnly ? "primary" : "default"}
                            onClick={() => handleFilterChange('selectedOnly', !filterState.selectedOnly)}
                            icon={filterState.selectedOnly ? <Check /> : undefined}
                            variant={filterState.selectedOnly ? "filled" : "outlined"}
                        />

                        {config.sortOptions && config.sortOptions.map(sortOption => (
                            <Chip
                                key={sortOption.label}
                                label={`Sort: ${sortOption.label}`}
                                color={filterState.sortBy === sortOption.label ? "primary" : "default"}
                                onClick={() => {
                                    if (filterState.sortBy === sortOption.label) {
                                        handleFilterChange('sortDirection',
                                            filterState.sortDirection === 'asc' ? 'desc' : 'asc'
                                        );
                                    } else {
                                        handleFilterChange('sortBy', sortOption.label);
                                        handleFilterChange('sortDirection', sortOption.direction || 'asc');
                                    }
                                }}
                                variant={filterState.sortBy === sortOption.label ? "filled" : "outlined"}
                            />
                        ))}
                    </Box>

                    {/* Results Summary */}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Showing {filteredOptions.length} of {options.length} options
                        {selectedIdList.length > 0 && ` (${selectedIdList.length} selected)`}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* Options List */}
                    <FormControl component="fieldset" variant='standard' fullWidth>
                        <FormGroup>
                            {filteredOptions.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                                    No options match your current filters
                                </Typography>
                            ) : (
                                filteredOptions.map(option => {
                                    const key = config.getKey(option);
                                    const checked = isChecked(key);

                                    return (
                                        <FormControlLabel
                                            key={String(key)}
                                            control={
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={(e) => handleChange(e)}
                                                    name={String(key)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography
                                                        variant="body1"
                                                        color={checked ? "primary" : "textPrimary"}
                                                    >
                                                        {config.getDisplayLabel(option)}
                                                    </Typography>
                                                    {config.getDisplayText(option) !== config.getDisplayLabel(option) && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            {config.getDisplayText(option)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            sx={{
                                                alignItems: 'flex-start',
                                                py: 0.5,
                                                backgroundColor: checked ? 'action.selected' : 'transparent',
                                                borderRadius: 1,
                                                px: 1,
                                                mx: -1
                                            }}
                                        />
                                    );
                                })
                            )}
                        </FormGroup>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)} startIcon={<Close />}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Advanced Filter Menu */}
            <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
            >
                <MenuItem>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filterState.selectedOnly}
                                onChange={(e) => handleFilterChange('selectedOnly', e.target.checked)}
                            />
                        }
                        label="Show Selected Only"
                    />
                </MenuItem>

                {/* Add property filters here if getFilterableProps is provided */}
                {config.getFilterableProps && (
                    <MenuItem>
                        <ListItemText primary="Advanced filters available" secondary="Extend this menu as needed" />
                    </MenuItem>
                )}
            </Menu>

            {/* Main Input Field */}
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