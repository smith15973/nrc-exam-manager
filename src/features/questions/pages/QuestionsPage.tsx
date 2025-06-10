import { useEffect, useState } from "react";
import ConfirmDelete from "../../../common/components/ConfirmDelete";
import { useDatabase } from "../../../common/hooks/useDatabase";
import ExportQuestionsButton from "../components/ExportQuestionsButton";
import ImportViewer from "../components/ImportViewer";
import QuestionForm from "../components/QuestionForm";
import QuestionsList from "../components/QuestionsList";
import QuestionsTable from "../components/QuestionsTable";






export default function QuestionsPage() {
    const { addQuestion, addQuestionsBatch, getQuestionsComplete, deleteQuestion } = useDatabase();
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

    const handleImport = async (questions: Question[]) => {
        const result = await addQuestionsBatch(questions)
        console.log(result)
        await loadQuestions();
    }

    const handleDeleteQuestions = () => {
        Promise.all(selectedIds.map(selectedId => deleteQuestion(selectedId)));
        loadQuestions();
        setSelectedIds([]);
    }

    return (
        <>
            <QuestionForm handleSubmit={handleSubmit} />
            <ImportViewer onSubmit={handleImport} />
            <ExportQuestionsButton questionIds={selectedIds} />
            <ConfirmDelete
                onConfirmDelete={handleDeleteQuestions}
                buttonText="Delete Selected"
                message={`Are you sure you want to delete this question? This will remove it from all exam associations! This action cannot be undone!`}
                disabled={!selectedIds.length}
            />
            <QuestionsTable
                questions={questions}
                checkable
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
            />
        </>
    )
}