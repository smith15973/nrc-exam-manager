
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface StemSelectProps {
    stemId: string;
    stems: Stem[];
    handleChange: (idx: string, value: string) => void
}

export default function StemSelect(props: StemSelectProps) {
    const { stemId, stems, handleChange } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="stem-select-label">Stem</InputLabel>
            <Select
                labelId="stem-select-label"
                id="stem-select"
                value={stemId}
                label="Stem"
                onChange={(e) => handleChange('stem_id', e.target.value)}
            >
                <MenuItem value={0}>Select an Stem</MenuItem>
                {stems.map((stem: Stem) => (
                    <MenuItem key={stem.stem_id} value={stem.stem_id}>
                        {stem.stem_id} - {stem.stem_statement}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}