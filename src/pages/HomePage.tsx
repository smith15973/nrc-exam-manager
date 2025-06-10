import { ImportExport } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';


export default function HomePage() {
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
        </>
    )
};