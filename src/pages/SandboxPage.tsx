import { Button, Typography } from "@mui/material";
import QuestionForm from "../features/questions/components/QuestionForm";


export default function SandboxPage() {

    const handleSubmitQuestionForm = (question: Question) => {
        console.log(question)
    }

    const handleSelectSBDatabase = async () => {
        try {
            const result = await window.files.selectSBDBLocation();
            console.log(result);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <Typography variant="h4">Sandbox/Private Mode</Typography>

            <Button onClick={handleSelectSBDatabase}>Choose Private Database Location</Button>

            <QuestionForm
                onSubmit={handleSubmitQuestionForm}

            />
        </>
    )
}