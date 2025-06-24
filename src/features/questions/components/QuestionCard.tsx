import { Card, CardContent, Checkbox, Typography } from "@mui/material";
import { Box } from "@mui/system";

interface QuestionCardProps {
    question: Question;
    sx?: import('@mui/system').SxProps;
}

export default function QuestionCard(props: QuestionCardProps) {
    const { question, sx } = props;

    return (
        <Card sx={{
            width: '100%',
            display: 'inline-block', // Important for column layout
            ...sx
        }}>
            {/* <CardHeader
                    action={
                        <Checkbox />
                    }
                /> */}
            <CardContent>
                <Box sx={{ justifyContent: 'right' }}>
                    <Checkbox />
                </Box>
                <Typography variant="body1"
                    sx={{
                        // color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        overflow: 'hidden',
                    }}>
                    {question.question_text}
                </Typography>
                <Typography variant="body2"
                    sx={{
                        color: 'text.secondary',
                    }}>
                    {question.img_url}
                </Typography>
            </CardContent>


        </Card>
    )
}