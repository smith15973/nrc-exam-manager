import { useEffect, useState } from "react";
import ConfirmDelete from "../../../common/components/ConfirmDelete";
import { useDatabase } from "../../../common/hooks/useDatabase";
import ExportQuestionsButton from "../components/ExportQuestionsButton";
import ImportViewer from "../components/ImportViewer";
import QuestionsTable from "../components/QuestionsTable";
import QuestionFormModal from "../components/QuestionForm";
import { useErrorHandler } from "../../../common/hooks/useErrorHandler";






export default function QuestionsPage() {
    const { addQuestion, getQuestionsComplete, deleteQuestion } = useDatabase();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState<QuestionFilters>();
    const { navigateToError } = useErrorHandler();



    useEffect(() => {
        loadQuestions();
        // console.log("FILTERS", filters)
    }, [filters]);

    const loadQuestions = async () => {
        try {
            const questions = await getQuestionsComplete(filters);
            setQuestions(questions)

        } catch (err) {
            const message = (err instanceof Error ? err.message : '').toLowerCase();

            if (message.includes('database') || message.includes('connection')) {
                navigateToError('network', 'Database connection failed while loading questions.');
            } else {
                navigateToError('general', 'An unexpected error occurred while loading KA.');
            }
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

    const handleImport = async () => {
        await loadQuestions();
        setSelectedIds([]);
    }

    const handleDeleteQuestions = () => {
        Promise.all(selectedIds.map(selectedId => deleteQuestion(selectedId)));
        loadQuestions();
        setSelectedIds([]);
    }

    const handleFilterChange = (key: string, value: unknown) => {
        console.log(filters)
        setFilters((prev) => ({ ...prev, [key]: value }))
    }






    return (
        <>
            <QuestionFormModal onSubmit={handleSubmit} />
            <ImportViewer onImport={handleImport} />
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