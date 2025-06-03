

import { Button } from '@mui/material';
import Box from '@mui/material/Box';;
import SystemSelect from './SystemSelect';


interface MultiSystemSelectProps {
    systemList: string[];
    systemOptions: System[];
    handleAddSystemClick: () => void;
    onSystemsUpdate: (newSystemList: string[]) => void;
}

export default function MultiSystemSelect(props: MultiSystemSelectProps) {
    const { systemList, systemOptions, handleAddSystemClick, onSystemsUpdate } = props;

    const handleSystemSelectChange = (idx: number, value: string) => {
        const updatedSystemList = [...systemList];
        updatedSystemList[idx] = value;
        onSystemsUpdate(updatedSystemList);
    }



    return (
        <Box sx={{ pb: 2 }}>
            {systemList?.map((systemNumber, idx) => {
                return (
                    <SystemSelect key={idx} handleChange={handleSystemSelectChange} systemNumber={systemNumber} systems={systemOptions} idx={idx} />
                )
            })}
            <Button onClick={handleAddSystemClick}>+ Add System</Button>
        </Box>
    )
}