import { useEffect, useState } from "react";
import { useDatabase } from "../../../common/hooks/useDatabase";
import QuestionForm from "../components/QuestionForm";
import QuestionsList from "../components/QuestionsList";
import QuestionsTable from "../components/QuestionsTable";






export default function QuestionsPage() {
    const { addQuestion, deleteQuestion, getQuestionsComplete } = useDatabase();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const questions = await getQuestionsComplete();
            setQuestions(questions)

        } catch (err) {
            setError("Failed to load exam questions")
        }
    }

    const handleSubmit = async (question: Question) => {
        await addQuestion(question);
        loadQuestions();
    }

    const onSelectionChange = (newSelectedIds: number[]) => {
        setSelectedIds(newSelectedIds)
    }

    return (
        <>
            <QuestionForm handleSubmit={handleSubmit} />
            <QuestionsTable
                questions={questions}
                checkable
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
            />
        </>
    )
}