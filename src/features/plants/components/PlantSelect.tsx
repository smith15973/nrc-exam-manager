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

// --- Props Interface ---
interface PlantSelectProps {
    plants: Plant[];
    handleChange: (key: string, value: Plant[] | Plant | number | null) => void;
    selectedIdList?: number[]; // for multiple
    selectedId?: number;       // for single
    multiple?: boolean;        // toggle between modes
}

// --- Styling Helpers ---
const LISTBOX_PADDING = 8;

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

// --- Virtualized List Rendering ---
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

    if (Array.isArray(dataSet) && dataSet.length === 3) {
        const [optionProps, option, state] = dataSet;
        const { key, ...restProps } = optionProps;

        return (
            <li key={key} {...restProps} style={inlineStyle}>
                <Checkbox style={{ marginRight: 8 }} checked={state.selected} />
                {option.name}
            </li>
        );
    }

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
            }
        ) => {
            itemData.push(item);
            itemData.push(...(item.children || []));
        }
    );

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
    const itemSize = smUp ? 48 : 56;

    const getChildSize = (child: React.ReactElement<unknown>) => {
        if (
            child &&
            typeof child === 'object' &&
            'props' in child &&
            child.props &&
            Object.prototype.hasOwnProperty.call(child.props, 'group')
        ) {
            return 48;
        }
        return itemSize;
    };

    const getHeight = () => {
        if (itemData.length > 8) {
            return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemData.length);

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
                    itemCount={itemData.length}
                >
                    {renderRow}
                </VariableSizeList>
            </OuterElementContext.Provider>
        </div>
    );
});

// --- Main Component ---
export default function PlantSelect(props: PlantSelectProps) {
    const {
        selectedIdList = [],
        selectedId,
        plants,
        handleChange,
        multiple = false,
    } = props;

    // Determine selected values
    const selectedOptions = React.useMemo(() => {
        if (multiple) {
            return plants.filter((p) => selectedIdList.includes(p.plant_id));
        }
        const found = plants.find((p) => p.plant_id === selectedId);
        return found ?? null;
    }, [plants, selectedIdList, selectedId, multiple]);

    // Handle selection change
    const handleAutocompleteChange = (
        event: React.SyntheticEvent,
        newValue: unknown
    ) => {
        if (multiple) {
            handleChange('plantIds', newValue as Plant[]);
        } else {
            const plant = newValue as Plant | null;
            handleChange('plant_id', plant ? plant.plant_id : null);
        }
    };

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <Autocomplete
                multiple={multiple}
                id="virtualized-plant-select"
                options={plants}
                value={selectedOptions}
                onChange={handleAutocompleteChange}
                disableCloseOnSelect={multiple}
                disableListWrap
                getOptionLabel={(option) => {
                    const plant = option as Plant;
                    return plant.name;
                }}

                isOptionEqualToValue={(option, value) => {
                    const opt = option as Plant;
                    const val = value as Plant;
                    return opt.plant_id === val.plant_id;
                }}

                renderOption={(props, option, state) => {
                    const plant = option as Plant;

                    return multiple
                        ? ([props, plant, state] as React.ReactNode)
                        : (
                            <li {...props} key={plant.plant_id}>
                                {plant.name}
                            </li>
                        );
                }}

                style={{ width: '100%' }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Plant Selection"
                        placeholder={multiple ? 'Select Plants' : 'Select a Plant'}
                    />
                )}
                PopperComponent={StyledPopper}
                ListboxComponent={multiple ? ListboxComponent : undefined}
            />
        </FormControl>
    );
}
