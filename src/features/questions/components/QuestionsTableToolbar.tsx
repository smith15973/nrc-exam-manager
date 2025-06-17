import { FilterList } from "@mui/icons-material";
import Delete from "@mui/icons-material/Delete";
import { IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { useState } from "react";
import SearchField from "../../../common/components/SearchField";
import FilterQuestions from "./FilterQuestions";

interface EnhancedTableToolbarProps {
  numSelected: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  open: boolean;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onFilterChange: (key: string, value: any) => void;
  filters: QuestionFilters;
  onResetFilters: () => void;
}

export default function QuestionsTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, searchQuery, onSearchChange, open, onOpenFilter, onCloseFilter, onFilterChange, filters, onResetFilters } = props;

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
        onChange={onSearchChange}
      />
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Delete />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton onClick={onOpenFilter}>
            <FilterList />
          </IconButton>
        </Tooltip>
      )}
      <FilterQuestions
        open={open}
        onClose={onCloseFilter}
        onFilterChange={onFilterChange}
        filters={filters}
        onResetFilters={onResetFilters}
      />
    </Toolbar>
  );
}