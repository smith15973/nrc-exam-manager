
import { MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';

interface PlantSelectProps {
    plant_id: number;
    plants: Plant[];
    handleChange: (key: string, value: number) => void
}

export default function PlantSelect(props: PlantSelectProps) {
    const { plant_id, plants, handleChange } = props;

    return (
        <FormControl fullWidth required>
            <InputLabel id="plant-select-label">Plant</InputLabel>
            <Select
                labelId="plant-select-label"
                id="plant-select"
                value={plant_id}
                label="Plant"
                onChange={(e) => handleChange('plant_id', e.target.value)}
            >
                <MenuItem value={0}>Select a Plant</MenuItem>
                {plants.map((plant: Plant) => (
                    <MenuItem key={plant.plant_id} value={plant.plant_id}>
                        {plant.name}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>Select the plant for this exam</FormHelperText>
        </FormControl>
    )
}