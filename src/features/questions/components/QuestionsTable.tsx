import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, FilterList, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import SearchField from '../../../common/components/SearchField';

interface QuestionTableProps {
  questions: Question[];
  checkable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export default function QuestionsTable(props: QuestionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { questions, checkable = false, selectedIds = [], onSelectionChange } = props;
  const navigate = useNavigate();

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = questions.map((q) => q.question_id);
      onSelectionChange?.(newSelected);
      return;
    }
    onSelectionChange?.([]);
  };

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

  const handleSearchQueryChange = (query: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    console.log(query)
    setSearchQuery(query);
  };

  interface EnhancedTableToolbarProps {
    numSelected: number;
  }
  function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected } = props;
    return (
      <Toolbar
        sx={[
          {
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          },
          numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          },
        ]}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Questions
          </Typography>
        )}
        <SearchField
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <Delete />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <FilterList />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  }

  function Row(props: { row: Question }) {
    const { row } = props;
    const [open, setOpen] = useState(false);
    const isItemSelected = selectedIds.includes(row.question_id);
    const labelId = `question-table-checkbox-${row.question_id}`;

    return (
      <TableRow
        hover
        onClick={(event) => checkable && handleClick(event, row.question_id)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        selected={isItemSelected}
        sx={{ cursor: checkable ? 'pointer' : 'default' }}
      >
        <TableCell padding="checkbox">
          {checkable && (
            <Checkbox
              color="primary"
              checked={isItemSelected}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          )}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
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
        <TableCell align="right" sx={{ width: '10%' }}>
          {row.last_used}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Box sx={{ height: 600, width: '100%', pt: 2 }}>
      <EnhancedTableToolbar numSelected={selectedIds.length} />
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>

            <TableRow>
              <TableCell padding="checkbox">
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
              <TableCell />
              <TableCell>Question</TableCell>
              <TableCell align="right">K/A #s</TableCell>
              <TableCell align="right">System #s</TableCell>
              <TableCell align="right">Exams</TableCell>
              <TableCell align="right">Last Used</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <Row key={question.question_id} row={question} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}