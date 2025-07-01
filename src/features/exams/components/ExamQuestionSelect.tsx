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
    handleChange: (key: string, value: unknown, idx?: number) => void; // Fixed to match parent handler
    selectedList: ExamQuestion[];
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

export default function ExamQuestionSelect(props: ExamSelectProps) {
    const { selectedList, exams, handleChange } = props;

    // Extract exam IDs from the selected ExamQuestion list
    const selectedExamIds = selectedList.map(eq => eq.exam_id);

    // Convert to Exam objects for the Autocomplete
    const selectedExams = React.useMemo(() => {
        return exams.filter(exam => selectedExamIds.includes(exam.exam_id));
    }, [exams, selectedExamIds]);

    const handleAutocompleteChange = (
        event: React.SyntheticEvent,
        newSelectedExams: Exam[]
    ) => {
        // Get the current selected exam IDs
        const currentExamIds = selectedList.map(eq => eq.exam_id);
        const newExamIds = newSelectedExams.map(exam => exam.exam_id);

        // Find newly added exams
        const addedExamIds = newExamIds.filter(id => !currentExamIds.includes(id));

        // Find removed exam IDs
        const removedExamIds = currentExamIds.filter(id => !newExamIds.includes(id));

        // Start with current selectedList
        let updatedList = [...selectedList];

        // Remove ExamQuestions for removed exams
        updatedList = updatedList.filter(eq => !removedExamIds.includes(eq.exam_id));

        // Add new ExamQuestions for added exams
        addedExamIds.forEach(examId => {
            const exam = exams.find(e => e.exam_id === examId);
            if (exam) {
                updatedList.push({
                    exam_id: examId,
                    question_id: 0,
                    exam: exam,
                    question_number: 0,
                    main_system_ka_system: null,
                    main_system_ka_ka: null,
                    ka_match_justification: '',
                    sro_match_justification: '',
                    answers_order: '',
                });
            }
        });

        // Call the parent handler with the updated ExamQuestion list
        handleChange("question_exams", updatedList);
    };

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <Autocomplete
                multiple
                id="virtualized-exam-select"
                options={exams}
                value={selectedExams}
                onChange={handleAutocompleteChange}
                disableCloseOnSelect
                disableListWrap
                getOptionLabel={(option) => option.name}
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