import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Box } from "@mui/system";
import CheckSystems from "../../../features/systems/components/CheckSystems";
import { useDatabase } from "../../../common/hooks/useDatabase";
import CheckKas from "../../kas/components/CheckKas";
import CheckExams from "../../../features/exams/components/CheckExams";

interface FilterQuestionsProps {
    open: boolean;
    onClose: () => void;
    onFilterChange: (key: string, value: any) => void;
    filters: QuestionFilters;
    onResetFilters: () => void;

}
/*
question_id?: number;
  query?: string;
  examIds?: number[];
  kaNums?: number[];
  systemNums?: number[];
  lastUsedStart?: string;
  lastUsedEnd?: string;
  examLevelStart?: string;
  examLevelEnd?: string;
  diffLevelStart?: string;
  diffLevelEnd?: string;
  cogLevelStart?: string;
  cogLevelEnd?: string;
  objective?: string;
  category?: string;
  technical_references?: string;
  */

export default function FilterQuestions(props: FilterQuestionsProps) {
    const { open, onClose, onFilterChange, filters, onResetFilters } = props;

    const { kas, systems, exams } = useDatabase();

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                disableRestoreFocus
                maxWidth="lg"
                fullWidth

            >

                <DialogTitle>
                    Filter
                </DialogTitle>
                <DialogContent>
                    <Button onClick={onResetFilters}
                        color="warning"
                        variant='contained'
                    >
                        Reset
                    </Button>

                    {/* Category */}
                    <Box
                        sx={{ pt: 1 }}
                    >
                        <TextField
                            fullWidth
                            type="text"
                            value={filters.category || ""}
                            onChange={(e) => onFilterChange("category", e.target.value)}
                            label="Category"
                        />
                    </Box>


                    {/* Last Used */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            type="date"
                            value={filters.lastUsedStart || ""}
                            onChange={(e) => onFilterChange("lastUsedStart", e.target.value)}
                            label="Last Used Start"
                            InputLabelProps={{ shrink: true }}
                            error={!!(filters.lastUsedStart && filters.lastUsedEnd && new Date(filters.lastUsedStart) > new Date(filters.lastUsedEnd))}
                            helperText={
                                filters.lastUsedStart &&
                                    filters.lastUsedEnd &&
                                    new Date(filters.lastUsedStart) > new Date(filters.lastUsedEnd)
                                    ? "Start date should be before end date"
                                    : ""
                            }
                        />
                        <TextField
                            type="date"
                            value={filters.lastUsedEnd || ""}
                            onChange={(e) => onFilterChange("lastUsedEnd", e.target.value)}
                            label="Last Used End"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>



                    {/* Exam Level */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            type="text"
                            value={filters.examLevelStart || ""}
                            onChange={(e) => onFilterChange("examLevelStart", e.target.value)}
                            label="Minimum Exam Level"
                            error={!!(filters.examLevelStart && filters.examLevelEnd && filters.examLevelStart > filters.examLevelEnd)}
                            helperText={
                                filters.examLevelStart &&
                                    filters.examLevelEnd &&
                                    filters.examLevelStart > filters.examLevelEnd
                                    ? "Minimum exam level should be less than or equal to max exam level"
                                    : ""
                            }
                        />
                        <TextField
                            type="text"
                            value={filters.examLevelEnd || ""}
                            onChange={(e) => onFilterChange("examLevelEnd", e.target.value)}
                            label="Max Exam Level"
                        />
                    </Box>


                    {/* Difficuilty Level */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            type="text"
                            value={filters.diffLevelStart || ""}
                            onChange={(e) => onFilterChange("diffLevelStart", e.target.value)}
                            label="Minimum Difficulty Level "
                            error={!!(filters.diffLevelStart && filters.diffLevelEnd && filters.diffLevelStart > filters.diffLevelEnd)}
                            helperText={
                                filters.diffLevelStart &&
                                    filters.diffLevelEnd &&
                                    filters.diffLevelStart > filters.diffLevelEnd
                                    ? "Minimum difficulty level should be less than or equal to max difficulty level"
                                    : ""
                            }
                        />
                        <TextField
                            type="text"
                            value={filters.diffLevelEnd || ""}
                            onChange={(e) => onFilterChange("diffLevelEnd", e.target.value)}
                            label="Max Difficulty Level"
                        />
                    </Box>


                    {/* Cognitive Level */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            type="text"
                            value={filters.cogLevelStart || ""}
                            onChange={(e) => onFilterChange("cogLevelStart", e.target.value)}
                            label="Minimum Cognitive Level"
                            error={!!(filters.cogLevelStart && filters.cogLevelEnd && filters.cogLevelStart > filters.cogLevelEnd)}
                            helperText={
                                filters.cogLevelStart &&
                                    filters.cogLevelEnd &&
                                    filters.cogLevelStart > filters.cogLevelEnd
                                    ? "Minimum cognitive level should be less than or equal to max cognitive level"
                                    : ""
                            }
                        />
                        <TextField
                            type="text"
                            value={filters.cogLevelEnd || ""}
                            onChange={(e) => onFilterChange("cogLevelEnd", e.target.value)}
                            label="Max Cognitive Level"
                        />
                    </Box>


                    {/* KAS */}
                    <Box>
                        <CheckKas
                            kaOptions={kas}
                            selectedIdList={filters.kaNums || []}
                            handleChange={(e) => { console.log(e) }} />
                    </Box>


                    {/* Systems */}
                    <Box>
                        <CheckSystems
                            systemOptions={systems}
                            selectedIdList={filters.systemNums || []}
                            handleChange={(e) => { console.log(e) }} />
                    </Box>

                    {/* Exams */}
                    <Box>
                        <CheckExams
                            examOptions={exams}
                            selectedIdList={filters.examIds || []}
                            handleChange={(e) => { console.log(e) }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>


            </Dialog>
        </>
    )
}