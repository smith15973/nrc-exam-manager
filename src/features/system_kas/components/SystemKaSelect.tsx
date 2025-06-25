
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface SystemKaSelectProps {
    system_kaNumber: string;
    system_kas: SystemKa[];
    handleChange: (idx: number, value: string) => void
    idx: number;
}

export default function SystemKaSelect(props: SystemKaSelectProps) {
    const { system_kaNumber, system_kas, handleChange, idx } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="system_ka-select-label">SystemKa</InputLabel>
            <Select
                labelId="system_ka-select-label"
                id="system_ka-select"
                value={system_kaNumber}
                label="KA"
                onChange={(e) => handleChange(idx, e.target.value)}
            >
                <MenuItem value={0}>Select a KA</MenuItem>
                {system_kas.map((system_ka: SystemKa) => (
                    <MenuItem key={system_ka.system_ka_number} value={system_ka.system_ka_number}>
                        {system_ka.system_ka_number}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}