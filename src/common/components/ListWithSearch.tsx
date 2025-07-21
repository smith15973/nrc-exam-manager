import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import {
  Box,
  TextField,
  InputAdornment,
  SxProps,
  Typography,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface ListWithSearchProps<T> {
  data: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  searchFilter: (item: T, searchTerm: string) => boolean;
  searchPlaceholder?: string;
  itemHeight?: number;
  sx?: SxProps;
  noResultsMessage?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

function ListWithSearch<T>({
  data,
  renderItem,
  searchFilter,
  searchPlaceholder = "Search...",
  itemHeight = 56,
  sx,
  noResultsMessage = "No results found",
  getItemKey
}: ListWithSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [containerHeight, setContainerHeight] = useState(0);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate container height dynamically
  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current && searchBarRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const searchBarRect = searchBarRef.current.getBoundingClientRect();
        const availableHeight = containerRect.height - searchBarRect.height;
        setContainerHeight(availableHeight);
      }
    };

    calculateHeight();

    const resizeObserver = new ResizeObserver(calculateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }
    return data.filter(item => searchFilter(item, searchTerm));
  }, [data, searchTerm, searchFilter]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Row renderer for react-window
  const renderRow: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const item = filteredData[index];
    if (!item) return null;

    const result = renderItem(item, index, style);
    return result === undefined ? null : <>{result}</>;
  };


  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      {/* Search Bar */}
      <Box ref={searchBarRef} sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* List Container */}
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {filteredData.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? noResultsMessage : 'No data available'}
            </Typography>
          </Box>
        ) : containerHeight > 0 ? (
          <FixedSizeList
            height={containerHeight}
            width={'100%'}
            itemSize={itemHeight}
            itemCount={filteredData.length}
            overscanCount={5}
            itemKey={getItemKey ? (index) => getItemKey(filteredData[index], index) : undefined}
          >
            {renderRow}
          </FixedSizeList>
        ) : null}
      </Box>
    </Box>
  );
}

export default ListWithSearch;