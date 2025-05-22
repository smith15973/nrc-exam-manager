import { useDatabase } from "../hooks/useDatabase";
import QuestionForm from "../questions/QuestionForm";
import QuestionsList from "../questions/QuestionsList";






export default function QuestionsPage() {
    const { questions, addQuestion, deleteQuestion, error } = useDatabase();

    const handleSubmit = async (question: Question) => {
        await addQuestion(question);
    }

    return (
        <>
            <h1>Questions Page</h1>
            <QuestionForm handleSubmit={handleSubmit} />
            <QuestionsList questions={questions} deleteQuestion={deleteQuestion} />
        </>
    )
}