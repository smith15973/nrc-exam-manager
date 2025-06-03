import { useDatabase } from "../../../common/hooks/useDatabase";
import QuestionForm from "../components/QuestionForm";
import QuestionsList from "../components/QuestionsList";






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