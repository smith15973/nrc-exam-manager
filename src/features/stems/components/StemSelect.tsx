
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface StemSelectProps {
    stemNumber: string;
    stems: Stem[];
    handleChange: (idx: number, value: string) => void
    idx: number;
}

export default function StemSelect(props: StemSelectProps) {
    const { stemNumber, stems, handleChange, idx } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="stem-select-label">Stem</InputLabel>
            <Select
                labelId="stem-select-label"
                id="stem-select"
                value={stemNumber}
                label="Stem"
                onChange={(e) => handleChange(idx, e.target.value)}
            >
                <MenuItem value={0}>Select an Stem</MenuItem>
                {stems.map((stem: Stem) => (
                    <MenuItem key={stem.stem_id} value={stem.stem_id}>
                        {stem.stem_statement}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}