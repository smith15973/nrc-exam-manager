import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';


export default function HomePage() {

    const handleChangeDatabase = async () => {
        try {
        const result = await window.files.changeDBLocation();
        console.log(result);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <Typography variant='h4'>NRC EXAM MANAGER</Typography>
            <Box>
                <Link to={"/plants"}>Plants</Link>
            </Box>
            <Box>
                <Link to={"/exams"}>Exams</Link>
            </Box>
            <Box>
                <Link to={"/questions"}>Questions</Link>
            </Box>
            <Box>
                <Link to={"/systems"}>Systems</Link>
            </Box>
            <Box>
                <Link to={"/kas"}>Kas</Link>
            </Box>
            <Box>
                <Link to={"/system_kas"}>SystemKas</Link>
            </Box>
            <Box>
                <Link to={"/stems"}>Stems</Link>
            </Box>
            <Box>
                <Link to={"/sandbox"}>Sandbox</Link>
            </Box>
            <Button onClick={handleChangeDatabase}>Change Database</Button>
        </>
    )
}