import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { Box } from "@mui/system";
import CheckSystems from "../../../features/systems/components/CheckSystems";
import { useDatabase } from "../../../common/hooks/useDatabase";
import CheckKas from "../../kas/components/CheckKas";
import CheckExams from "../../../features/exams/components/CheckExams";
import SystemKaSelect from "../../../features/system_kas/components/SystemKaSelect";
import PlantSelect from "../../../features/plants/components/PlantSelect";

interface FilterQuestionsProps {
    open: boolean;
    onClose: () => void;
    onFilterChange: (key: string, value: unknown) => void;
    filters: QuestionFilters;
    onResetFilters: () => void;

}

export default function FilterQuestions(props: FilterQuestionsProps) {
    const { open, onClose, onFilterChange, filters, onResetFilters } = props;

    const { plants, kas, systems, exams, system_kas } = useDatabase();

    const handleSystemKaChange = (key: string, value: SystemKa[]) => {
        const idList = value.map(sk => sk.system_ka_number)
        onFilterChange('system_kaNums', idList)
    }
    const handlePlantChange = (key: string, value: Plant[]) => {
        const idList = value.map(plant => plant.plant_id)
        onFilterChange('plantIds', idList)
    }

    const handleRadioClick = <K extends keyof QuestionFilters>(
        key: K,
        value: QuestionFilters[K]
    ) => {
        if (filters[key] === value) {
            onFilterChange(key, undefined);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                disableRestoreFocus
                maxWidth="md"
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

                    {/* Question Text */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            fullWidth
                            type="text"
                            value={filters.question_text || ""}
                            onChange={(e) => onFilterChange("question_text", e.target.value)}
                            label="Question"
                        />
                    </Box>

                    {/* Objective */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            fullWidth
                            type="text"
                            value={filters.objective || ""}
                            onChange={(e) => onFilterChange("objective", e.target.value)}
                            label="Objective"
                        />
                    </Box>
                    {/* Technical References */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <TextField
                            fullWidth
                            type="text"
                            value={filters.technical_references || ""}
                            onChange={(e) => onFilterChange("technical_references", e.target.value)}
                            label="Technical References"
                        />
                    </Box>

                    <Box sx={{ pt: 2, display: 'flex' }}>
                        <Box sx={{ flex: 1 }}>
                            <FormControl>
                                <FormLabel id="exam-level-radio-group">Exam Level</FormLabel>
                                <RadioGroup
                                    aria-labelledby="exam-level-radio-group"
                                    name="controlled-exam-level-radio-group"
                                    value={filters.exam_level ?? ''}
                                    onChange={(e) => onFilterChange('exam_level', parseInt(e.target.value))}
                                >
                                    <FormControlLabel
                                        value={0}
                                        control={<Radio />}
                                        label="RO"
                                        onClick={() => handleRadioClick('exam_level', 0)}
                                    />
                                    <FormControlLabel
                                        value={1}
                                        control={<Radio />}
                                        label="SRO"
                                        onClick={() => handleRadioClick('exam_level', 1)}
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <FormControl>
                                <FormLabel id="cognitive-level-radio-group">Cognitive Level</FormLabel>
                                <RadioGroup
                                    aria-labelledby="cognitive-level-radio-group"
                                    name="controlled-cognitive-level-radio-group"
                                    value={filters.cognitive_level ?? ''}
                                    onChange={(e) => onFilterChange('cognitive_level', parseInt(e.target.value))}
                                >
                                    <FormControlLabel value={0} control={<Radio />} label="LOW" onClick={() => handleRadioClick('cognitive_level', 0)} />
                                    <FormControlLabel value={1} control={<Radio />} label="HIGH" onClick={() => handleRadioClick('cognitive_level', 1)} />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Box>



                    {/* KAS */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <CheckKas
                            kaOptions={kas}
                            selectedIdList={filters.kaNums || []}
                            handleChange={(e) => {
                                const kaNum = e.currentTarget.name;
                                let newList: string[];

                                if (e.currentTarget.checked) {
                                    // Add KA number if checked
                                    newList = [...(filters.kaNums || []), kaNum];
                                } else {
                                    // Remove KA number if unchecked
                                    newList = (filters.kaNums || []).filter(num => num !== kaNum);
                                }

                                onFilterChange("kaNums", newList);
                            }}
                        />
                    </Box>


                    {/* Systems */}
                    <Box
                        sx={{ pt: 2 }}
                    >
                        <CheckSystems
                            systemOptions={systems}
                            selectedIdList={filters.systemNums || []}
                            handleChange={(e) => {
                                const systemNum = e.currentTarget.name;
                                let newList: string[];

                                if (e.currentTarget.checked) {
                                    // Add system number if checked
                                    newList = [...(filters.systemNums || []), systemNum];
                                } else {
                                    // Remove system number if unchecked
                                    newList = (filters.systemNums || []).filter(num => num !== systemNum);
                                }

                                onFilterChange("systemNums", newList);
                            }}
                        />
                    </Box>

                    {/* System_KAs */}
                    <Box sx={{ pt: 2 }} >
                        <SystemKaSelect
                            system_kas={system_kas}
                            handleChange={handleSystemKaChange}
                            selectedIdList={filters.system_kaNums || []}
                        />
                    </Box>
                    {/* Plants */}
                    <Box sx={{ pt: 2 }} >
                        <PlantSelect
                            plants={plants}
                            handleChange={handlePlantChange}
                            selectedIdList={filters.plantIds || []}
                            multiple={true}
                        />
                    </Box>

                    {/* Exams */}
                    <Box
                    // sx={{ pt: 2 }}
                    >
                        <CheckExams
                            examOptions={exams}
                            selectedIdList={filters.examIds || []}
                            handleChange={(e) => {
                                const examId = parseInt(e.currentTarget.name);
                                let newList: number[];

                                if (e.currentTarget.checked) {
                                    // Add exam ID if checked
                                    newList = [...(filters.examIds || []), examId];
                                } else {
                                    // Remove exam ID if unchecked
                                    newList = (filters.examIds || []).filter(id => id !== examId);
                                }

                                onFilterChange("examIds", newList);
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>


            </Dialog>
        </>
    )
}