import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import QuestionsTableToolbar from './QuestionsTableToolbar';

// Types
type SortDirection = 'off' | 'asc' | 'desc';
type SortField = 'question_text' | 'question_id' | 'system_kas' | 'exams' | 'exam_level' | 'question_number';

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

interface SortIndicatorProps {
  field: SortField;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
}

interface QuestionTableProps {
  questions: Question[];
  checkable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  onFilterChange: (key: string, value: unknown) => void;
  filters?: QuestionFilters;
  onResetFilters: () => void;
  examId?: number;
}

// Define sort states
const SORT_STATES: Record<string, SortDirection> = {
  OFF: 'off',
  ASC: 'asc',
  DESC: 'desc'
} as const;

// Column configuration with flexible widths
const COLUMN_CONFIG = {
  checkbox: {
    minWidth: 48,
    flex: 0,
    basis: '48px',
    maxWidth: '48px'
  },
  question_id: {
    minWidth: 0,
    flex: 0,
    basis: '48px',
    maxWidth: '48px'
  },
  question_number: {
    minWidth: 0,
    flex: 0,
    basis: '48px',
    maxWidth: '48px'
  },
  question: {
    minWidth: 200,
    flex: 0,
    basis: '50%',
    maxWidth: '500px'
  },
  systemKA: {
    minWidth: 100,
    flex: 0,
    basis: '15%',
    maxWidth: '500px'
  },
  exams: {
    minWidth: 100,
    flex: 0,
    basis: '15%',
    maxWidth: '500px'
  },
  examLevel: {
    minWidth: 80,
    flex: 0,
    basis: '10%',
    maxWidth: '500px'
  },
  view: {
    minWidth: 80,
    flex: 0,
    basis: '10%',
    maxWidth: '500px'
  }
};

const getFlexibleWidth = (config: typeof COLUMN_CONFIG[keyof typeof COLUMN_CONFIG]) => ({
  minWidth: config.minWidth,
  flex: `${config.flex} 1 ${config.basis}`,
  maxWidth: config.maxWidth || (config.flex > 2 ? 'none' : `${config.minWidth * 3}px`)
});

// Sort indicator component
const SortIndicator: React.FC<SortIndicatorProps> = ({ field, sortConfig, onSort }) => {
  const isActive = sortConfig.field === field;
  const direction = isActive ? sortConfig.direction : SORT_STATES.OFF;

  return (
    <IconButton
      size="small"
      onClick={() => onSort(field)}
      sx={{
        ml: 1,
        padding: '2px',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      aria-label={`Sort by ${field}`}
    >
      {direction === SORT_STATES.OFF && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '16px',
          justifyContent: 'center'
        }}>
          <KeyboardArrowUp sx={{ fontSize: '12px', opacity: 0.3, marginBottom: '-2px' }} />
          <KeyboardArrowDown sx={{ fontSize: '12px', opacity: 0.3, marginTop: '-2px' }} />
        </Box>
      )}
      {direction === SORT_STATES.ASC && (
        <KeyboardArrowUp sx={{ fontSize: '16px', color: 'primary.main' }} />
      )}
      {direction === SORT_STATES.DESC && (
        <KeyboardArrowDown sx={{ fontSize: '16px', color: 'primary.main' }} />
      )}
    </IconButton>
  );
};

const VirtuosoTableComponents: TableComponents<Question> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'auto' }} />
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
  const [openFilters, setOpenFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: SORT_STATES.OFF
  });

  const { questions, checkable = false, selectedIds = [], onSelectionChange, filters, onFilterChange, onResetFilters, examId } = props;
  const navigate = useNavigate();

  // Set default sort based on examId presence
  useEffect(() => {
    const defaultField = examId ? 'question_number' : 'question_id';
    setSortConfig({
      field: defaultField,
      direction: SORT_STATES.ASC
    });
  }, [examId]);

  // Sort handler function
  const handleSort = (field: SortField): void => {
    setSortConfig((prevConfig: SortConfig) => {
      if (prevConfig.field !== field) {
        // New field selected, start with ascending
        return { field, direction: SORT_STATES.ASC };
      }

      // Same field clicked, cycle through states
      switch (prevConfig.direction) {
        case SORT_STATES.OFF:
          return { field, direction: SORT_STATES.ASC };
        case SORT_STATES.ASC:
          return { field, direction: SORT_STATES.DESC };
        case SORT_STATES.DESC:
          return { field: null, direction: SORT_STATES.OFF };
        default:
          return { field, direction: SORT_STATES.ASC };
      }
    });
  };

  // Sort the questions based on current sort config
  const sortedQuestions = React.useMemo(() => {
    if (!sortConfig.field || sortConfig.direction === SORT_STATES.OFF) {
      return questions;
    }

    return [...questions].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortConfig.field) {
        case 'question_id':
          aValue = a.question_id || 0;
          bValue = b.question_id || 0;
          break;
        case 'question_number':
          aValue = a.question_exams?.find(qe => qe.exam_id === examId)?.question_number || 0;
          bValue = b.question_exams?.find(qe => qe.exam_id === examId)?.question_number || 0;
          break;
        case 'question_text':
          aValue = a.question_text || '';
          bValue = b.question_text || '';
          break;
        case 'system_kas':
          aValue = a.system_kas?.length || 0;
          bValue = b.system_kas?.length || 0;
          break;
        case 'exams':
          aValue = a.exams?.length || 0;
          bValue = b.exams?.length || 0;
          break;
        case 'exam_level':
          aValue = a.exam_level || 0;
          bValue = b.exam_level || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortConfig.direction === SORT_STATES.ASC) {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [questions, sortConfig, examId]);

  const handleNavigate = (questionId: number) => {
    if (examId) {
      navigate(`/exams/${examId}/questions/${questionId}`)
    } else {
      navigate(`/questions/${questionId}`)
    }
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = questions.map((q) => q.question_id);
      onSelectionChange?.(newSelected);
      return;
    }
    onSelectionChange?.([]);
  };

  const handleSearchQueryChange = (value: unknown) => {
    if (onFilterChange) {
      onFilterChange('query', value)
    }
  };

  function fixedHeaderContent() {
    return (
      <TableRow sx={{ backgroundColor: 'background.paper' }}>
        <TableCell
          padding="checkbox"
          sx={getFlexibleWidth(COLUMN_CONFIG.checkbox)}
        >
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

        <TableCell sx={getFlexibleWidth(COLUMN_CONFIG.question_id)}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            ID
            <SortIndicator field="question_id" sortConfig={sortConfig} onSort={handleSort} />
          </Box>
        </TableCell>

        {examId && (
          <TableCell sx={getFlexibleWidth(COLUMN_CONFIG.question_number)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Q#
              <SortIndicator field="question_number" sortConfig={sortConfig} onSort={handleSort} />
            </Box>
          </TableCell>
        )}

        <TableCell sx={getFlexibleWidth(COLUMN_CONFIG.question)}>
          <Box sx={{ display: 'flex', alignItems: 'left' }}>
            Question
            <SortIndicator field="question_text" sortConfig={sortConfig} onSort={handleSort} />
          </Box>
        </TableCell>

        <TableCell
          align="right"
          sx={getFlexibleWidth(COLUMN_CONFIG.systemKA)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            System KA #s
            <SortIndicator field="system_kas" sortConfig={sortConfig} onSort={handleSort} />
          </Box>
        </TableCell>

        <TableCell
          align="right"
          sx={getFlexibleWidth(COLUMN_CONFIG.exams)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            Exams
            <SortIndicator field="exams" sortConfig={sortConfig} onSort={handleSort} />
          </Box>
        </TableCell>

        <TableCell
          align="right"
          sx={getFlexibleWidth(COLUMN_CONFIG.examLevel)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            Exam Level
            <SortIndicator field="exam_level" sortConfig={sortConfig} onSort={handleSort} />
          </Box>
        </TableCell>

        <TableCell
          align="right"
          sx={getFlexibleWidth(COLUMN_CONFIG.view)}
        >
          View
        </TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, row: Question) {
    const isItemSelected = selectedIds.includes(row.question_id);
    const labelId = `question-table-checkbox-${row.question_id}`;
    const questionNumber = row.question_exams?.find(qe => qe.exam_id === examId)?.question_number

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
        <TableCell align="left">
          {row.question_id}
        </TableCell>
        {examId && (
          <TableCell align="left">
            {questionNumber}
          </TableCell>
        )}
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          sx={{
            minWidth: COLUMN_CONFIG.question.minWidth,
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          }}
        >
          {row.question_text}
        </TableCell>
        <TableCell align="right">
          {row.system_kas && row.system_kas.length > 0 && (
            <>
              {row.system_kas.slice(0, 3).map((system_ka, index) => (
                <div key={index}>{system_ka.system_ka_number}</div>
              ))}
              {row.system_kas.length > 3 && ` +${row.system_kas.length - 3} more`}
            </>
          )}
        </TableCell>
        <TableCell align="right">
          {row.exams && row.exams.length > 0 && (
            <>
              {row.exams?.slice(0, 3).map((exam, index) => (
                <div key={index}>{exam.name}</div>
              ))}
              {row.exams.length > 3 && ` +${row.exams.length - 3} more`}
            </>
          )}
        </TableCell>
        <TableCell align="right">
          {row.exam_level === 1 ? "SRO" : "RO"}
        </TableCell>
        <TableCell align="right">
          <Button variant='contained' onClick={() => handleNavigate(row.question_id)}>View</Button>
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
    <Box sx={{
      height: '80vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      py: 2
    }}>
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
      <Paper style={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <TableVirtuoso
          data={sortedQuestions}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>
    </Box>
  );
}