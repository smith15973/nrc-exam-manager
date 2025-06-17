import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import QuestionsTableToolbar from './QuestionsTableToolbar';

interface QuestionTableProps {
  questions: Question[];
  checkable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  onFilterChange: (key: string, value: any) => void;
  filters?: QuestionFilters;
  onResetFilters: () => void;
}

const VirtuosoTableComponents: TableComponents<Question> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

export default function QuestionsTable(props: QuestionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilters, setOpenFilters] = useState(false);
  const { questions, checkable = false, selectedIds = [], onSelectionChange, filters, onFilterChange, onResetFilters } = props;
  const navigate = useNavigate();

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = questions.map((q) => q.question_id);
      onSelectionChange?.(newSelected);
      return;
    }
    onSelectionChange?.([]);
  };

  const handleSearchQueryChange = (value: any) => {
    if (onFilterChange) {
      onFilterChange('query', value)
    }
  };

  function fixedHeaderContent() {
    return (
      <TableRow sx={{ backgroundColor: 'background.paper' }}>
        <TableCell padding="checkbox" sx={{ width: 48 }}>
          {checkable && (
            <Checkbox
              color="primary"
              indeterminate={
                selectedIds.length > 0 && selectedIds.length < questions.length
              }
              checked={questions.length > 0 && selectedIds.length === questions.length}
              onChange={handleSelectAllClick}
              inputProps={{ 'aria-label': 'select all questions' }}
            />
          )}
        </TableCell>
        <TableCell sx={{ width: '40%' }}>Question</TableCell>
        <TableCell align="right" sx={{ width: '15%' }}>K/A #s</TableCell>
        <TableCell align="right" sx={{ width: '15%' }}>System #s</TableCell>
        <TableCell align="right" sx={{ width: '15%' }}>Exams</TableCell>
        <TableCell align="right" sx={{ width: '10%' }}>Last Used</TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, row: Question) {
    const isItemSelected = selectedIds.includes(row.question_id);
    const labelId = `question-table-checkbox-${row.question_id}`;

    return (
      <React.Fragment>
        <TableCell padding="checkbox">
          {checkable && (
            <Checkbox
              color="primary"
              checked={isItemSelected}
              inputProps={{ 'aria-labelledby': labelId }}
              onClick={(event) => {
                event.stopPropagation();
                handleClick(event, row.question_id);
              }}
            />
          )}
        </TableCell>
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          sx={{
            width: '40%',
            maxWidth: '40%',
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          }}
        >
          {row.question_text}
        </TableCell>
        <TableCell align="right">
          {row.kas && row.kas.length > 0 && (
            <>
              {row.kas.slice(0, 3).map((ka, index) => (
                <div key={index}>{ka.ka_number}</div>
              ))}
              {row.kas.length > 3 && ` +${row.kas.length - 3} more`}
            </>
          )}
        </TableCell>
        <TableCell align="right">
          {row.systems && row.systems.length > 0 && (
            <>
              {row.systems.slice(0, 3).map((system, index) => (
                <div key={index}>{system.number}</div>
              ))}
              {row.systems.length > 3 && ` +${row.systems.length - 3} more`}
            </>
          )}
        </TableCell>
        <TableCell align="right">
          {row.exams && row.exams.length > 0 && (
            <>
              {row.exams.slice(0, 3).map((exam, index) => (
                <div key={index}>{exam.name}</div>
              ))}
              {row.exams.length > 3 && ` +${row.exams.length - 3} more`}
            </>
          )}
        </TableCell>
        <TableCell align="right">
          {row.last_used}
        </TableCell>
      </React.Fragment>
    );
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedIds, id];
    } else if (selectedIndex === 0) {
      newSelected = selectedIds.slice(1);
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = selectedIds.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selectedIds.slice(0, selectedIndex),
        ...selectedIds.slice(selectedIndex + 1),
      ];
    }
    onSelectionChange?.(newSelected);
  };

  return (
    <Box sx={{ height: 600, width: '100%', py: 2 }}>
      <QuestionsTableToolbar
        numSelected={selectedIds.length}
        searchQuery={filters?.query || ''}
        onSearchChange={handleSearchQueryChange}
        open={openFilters}
        onCloseFilter={() => setOpenFilters(false)}
        onOpenFilter={() => setOpenFilters(true)}
        onFilterChange={onFilterChange}
        filters={filters || {}}
        onResetFilters={onResetFilters}

      />
      <Paper style={{ height: 600, width: '100%' }}>
        <TableVirtuoso
          data={questions}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>
    </Box>
  );
}