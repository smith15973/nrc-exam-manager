import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';


export default function HomePage() {
    return (
        <>
            <Typography variant='h4'>NRC EXAM MANAGER</Typography>
            <Box>
                <Link to={"/plants"}>Plants</Link>
                <Link to={"/plants"}>Exams</Link>
                <Link to={"/plants"}>Questions</Link>
            </Box>

        </>
    )
};