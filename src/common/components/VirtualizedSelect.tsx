import * as React from 'react';
import { FormControl, Autocomplete, TextField, autocompleteClasses } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';

const LISTBOX_PADDING = 8; // px

interface VirtualizedSelectProps {
  value: string;
  options: string[];
  label: string;
  fieldKey: string;
  handleChange: (key: string, value: string) => void;
  required?: boolean;
  fullWidth?: boolean;
  sx?: any;
}

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

  const { key, ...optionProps } = dataSet[0];

  return (
    <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
      {dataSet[1]}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
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
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactElement<unknown>) => {
    if (Object.prototype.hasOwnProperty.call(child, 'group')) {
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

export default function VirtualizedSelect(props: VirtualizedSelectProps) {
  const { 
    value, 
    options, 
    label, 
    fieldKey, 
    handleChange, 
    required = false, 
    fullWidth = true,
    sx = { pb: 2 }
  } = props;

  return (
    <FormControl sx={sx} fullWidth={fullWidth} required={required}>
      <Autocomplete
        value={value}
        options={options}
        disableListWrap
        onChange={(_, value) => handleChange(fieldKey, value || "")}
        renderInput={(params) => <TextField {...params} label={label} />}
        renderOption={(props, option, state) =>
          [props, option, state.index] as React.ReactNode
        }
        renderGroup={(params) => params as any}
        slots={{
          popper: StyledPopper,
        }}
        slotProps={{
          listbox: {
            component: ListboxComponent,
          },
        }}
      />
    </FormControl>
  );
}