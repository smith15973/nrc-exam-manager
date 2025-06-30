import * as React from 'react';
import {
    FormControl,
    Autocomplete,
    Checkbox,
    TextField,
    Popper,
    autocompleteClasses,
    useMediaQuery,
    useTheme,
    styled,
    ListSubheader,
} from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';

interface ExamSelectProps {
    exams: Exam[];
    handleChange: (key: string, value: Exam[]) => void; // Changed from string[] to Exam[]
    selectedIdList: number[];
}

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
    const { data, index, style } = props;
    const dataSet = data[index];
    const inlineStyle = {
        ...style,
        top: (style.top as number) + LISTBOX_PADDING,
    };

    if (Object.prototype.hasOwnProperty.call(dataSet, 'group')) {
        return (
            <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
                {dataSet.group}
            </ListSubheader>
        );
    }

    // Fix: Properly destructure the array from renderOption
    if (Array.isArray(dataSet) && dataSet.length === 3) {
        const [optionProps, option, state] = dataSet;
        const { key, ...restProps } = optionProps;

        return (
            <li key={key} {...restProps} style={inlineStyle}>
                <Checkbox
                    style={{ marginRight: 8 }}
                    checked={state.selected}
                />
                {option.name}
            </li>
        );
    }

    // Fallback for any unexpected data structure
    return null;
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: number) {
    const ref = React.useRef<VariableSizeList>(null);
    React.useEffect(() => {
        if (ref.current != null) {
            ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactElement<unknown>[] = [];

    (children as React.ReactElement<unknown>[]).forEach(
        (
            item: React.ReactElement<unknown> & {
                children?: React.ReactElement<unknown>[];
            },
        ) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        },
    );

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 48 : 56; // Slightly larger for checkbox items

    const getChildSize = (child: React.ReactElement<unknown>) => {
        if (child && typeof child === 'object' && 'props' in child && child.props && Object.prototype.hasOwnProperty.call(child.props, 'group')) {
            return 48;
        }
        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
            <OuterElementContext.Provider value={other}>
                <VariableSizeList
                    itemData={itemData}
                    height={getHeight() + 2 * LISTBOX_PADDING}
                    width="100%"
                    ref={gridRef}
                    outerElementType={OuterElementType}
                    innerElementType="ul"
                    itemSize={(index) => getChildSize(itemData[index])}
                    overscanCount={5}
                    itemCount={itemCount}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

export default function ExamSelect(props: ExamSelectProps) {
    const { selectedIdList, exams, handleChange } = props;

    // Convert selectedIdList to the format expected by Autocomplete
    const selectedOptions = React.useMemo(() => {
        return exams.filter(exam =>
            selectedIdList.includes(exam.exam_id)
        );
    }, [exams, selectedIdList]);

    const handleAutocompleteChange = (
        event: React.SyntheticEvent,
        newValue: Exam[]
    ) => {
        // Pass the full Exam objects, not just IDs
        console.log('New selected Exams:', newValue);
        handleChange("exams", newValue);
    };

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <Autocomplete
                multiple
                id="virtualized-exam-select"
                options={exams}
                value={selectedOptions}
                onChange={handleAutocompleteChange}
                disableCloseOnSelect
                disableListWrap
                getOptionLabel={(option) => option.name}
                // Fix: Ensure isOptionEqualToValue works correctly
                isOptionEqualToValue={(option, value) =>
                    option.exam_id === value.exam_id
                }
                renderOption={(props, option, state) => {
                    // Return the array format expected by the virtualized list
                    return [props, option, state] as React.ReactNode;
                }}
                style={{ width: '100%' }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Exam Selection"
                        placeholder="Select Exam"
                    />
                )}
                PopperComponent={StyledPopper}
                ListboxComponent={ListboxComponent}
            />
        </FormControl>
    );
}