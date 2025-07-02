import { useEffect, useState } from "react";
import ConfirmDelete from "../../../common/components/ConfirmDelete";
import { useDatabase } from "../../../common/hooks/useDatabase";
import ExportQuestionsButton from "../components/ExportQuestionsButton";
import ImportViewer from "../components/ImportViewer";
import QuestionForm from "../components/QuestionForm";
import QuestionsTable from "../components/QuestionsTable";






export default function QuestionsPage() {
    const { addQuestion, addQuestionsBatch, getQuestionsComplete, deleteQuestion } = useDatabase();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<QuestionFilters>();



    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        try {
            const questions = await getQuestionsComplete(filters);
            setQuestions(questions)

        } catch (err) {
            setError("Failed to load exam questions")
        }
    }

    const handleSubmit = async (question: Question) => {
        await addQuestion(question);
        loadQuestions();
        setSelectedIds([]);
    }

    const onSelectionChange = (newSelectedIds: number[]) => {
        setSelectedIds(newSelectedIds)
    }

    const handleImport = async (questions: Question[]) => {
        const result = await addQuestionsBatch(questions)
        console.log(result)
        await loadQuestions();
        setSelectedIds([]);
    }

    const handleDeleteQuestions = () => {
        Promise.all(selectedIds.map(selectedId => deleteQuestion(selectedId)));
        loadQuestions();
        setSelectedIds([]);
    }

    const handleFilterChange = (key: string, value: unknown) => {
        console.log(value)
        setFilters((prev) => ({ ...prev, [key]: value }))
        // loadQuestions();
    }






    return (
        <>
            <QuestionForm onSubmit={handleSubmit} />
            <ImportViewer onSubmit={handleImport} />
            <ExportQuestionsButton questionIds={selectedIds} onExport={() => { setSelectedIds([]) }} />
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
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={() => setFilters({})}
            />
        </>
    )
}