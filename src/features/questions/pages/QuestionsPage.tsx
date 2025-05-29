import { useEffect, useState } from "react";
import { useDatabase } from "../../../common/hooks/useDatabase";
import QuestionForm from "../components/QuestionForm";
import QuestionsList from "../components/QuestionsList";






export default function QuestionsPage() {
    const { questions, data } = useDatabase();
    const [questionsList, setQuestionsList] = useState<Question[]>([]);

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        const result = await data({ entity: 'questions', action: 'read' })
        if (result.success) {
            setQuestionsList(result.data)
        } else {
            console.error(result.error || "Failed to load questions")
        }
    }

    const handleSubmit = async (question: Question) => {
        const result = await data({ entity: 'questions', action: 'create', data: question })
        if (result.success) {
            loadQuestions();
        } else {
            console.error(result.error || "Failed to add question")
        }
    }

    const handleDeleteQuestion = async (id: number) => {
        const result = await data({ entity: 'questions', action: 'delete', data: id })
        if (result.success) {
            loadQuestions();
        } else {
            console.error(result.error || "Failed to add question")
        }
    }


    return (
        <>
            <h1>Questions Page</h1>
            <QuestionForm handleSubmit={handleSubmit} />
            <QuestionsList questions={questionsList} deleteQuestion={handleDeleteQuestion} />
        </>
    )
}