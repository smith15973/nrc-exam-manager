

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import SystemKaSelect from './SystemKaSelect';


interface MultiSystemKaSelectProps {
    system_kaList: string[];
    system_kaOptions: SystemKa[];
    handleAddSystemKaClick: () => void;
    onSystemKasUpdate: (newSystemKaList: string[]) => void;
}

export default function MultiSystemKaSelect(props: MultiSystemKaSelectProps) {
    const { system_kaList, system_kaOptions, handleAddSystemKaClick, onSystemKasUpdate } = props;

    const handleSystemKaSelectChange = (idx: number, value: string) => {
        const updatedSystemKaList = [...system_kaList];
        updatedSystemKaList[idx] = value;
        onSystemKasUpdate(updatedSystemKaList);
    }



    return (
        <Box sx={{ pb: 2 }}>
            {system_kaList?.map((system_kaNumber, idx) => {
                return (
                    <SystemKaSelect key={idx} handleChange={handleSystemKaSelectChange} system_kaNumber={system_kaNumber} system_kas={system_kaOptions} idx={idx} />
                )
            })}
            <Button onClick={handleAddSystemKaClick}>+ Add SystemKa</Button>
        </Box>
    )
}