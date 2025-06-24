

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import KaSelect from './KaSelect';


interface MultiKaSelectProps {
    kaList: string[];
    kaOptions: Ka[];
    handleAddKaClick: () => void;
    onKasUpdate: (newKaList: string[]) => void;
}

export default function MultiKaSelect(props: MultiKaSelectProps) {
    const { kaList, kaOptions, handleAddKaClick, onKasUpdate } = props;

    const handleKaSelectChange = (idx: number, value: string) => {
        const updatedKaList = [...kaList];
        updatedKaList[idx] = value;
        onKasUpdate(updatedKaList);
    }



    return (
        <Box sx={{ pb: 2 }}>
            {kaList?.map((kaNumber, idx) => {
                return (
                    <KaSelect key={idx} handleChange={handleKaSelectChange} kaNumber={kaNumber} kas={kaOptions} idx={idx} />
                )
            })}
            <Button onClick={handleAddKaClick}>+ Add Ka</Button>
        </Box>
    )
}