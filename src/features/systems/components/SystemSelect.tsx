
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

interface SystemSelectProps {
    systemNumber: string;
    systems: System[];
    handleChange: (key: string, value: string) => void;
}

export default function SystemSelect(props: SystemSelectProps) {
    const { systemNumber, systems, handleChange } = props;

    return (
        <FormControl sx={{ pb: 2 }} fullWidth required>
            <InputLabel id="system-select-label">System</InputLabel>
            <Select
                labelId="system-select-label"
                id="system-select"
                value={systemNumber}
                label="System"
                onChange={(e) => handleChange('system_number', e.target.value)}
            >
                <MenuItem value={0}>Select an System</MenuItem>
                {systems.map((system: System) => (
                    <MenuItem key={system.system_number} value={system.system_number}>
                        {system.system_number} - {system.system_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}