
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface KaSelectProps {
    kaNumber: string;
    kas: Ka[];
    handleChange: (idx: number, value: string) => void
    idx: number;
}

export default function KaSelect(props: KaSelectProps) {
    const { kaNumber, kas, handleChange, idx } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="ka-select-label">Ka</InputLabel>
            <Select
                labelId="ka-select-label"
                id="ka-select"
                value={kaNumber}
                label="KA"
                onChange={(e) => handleChange(idx, e.target.value)}
            >
                <MenuItem value={0}>Select a KA</MenuItem>
                {kas.map((ka: Ka) => (
                    <MenuItem key={ka.ka_number} value={ka.ka_number}>
                        {ka.ka_description}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}