import { useEffect, useState } from "react";
import ConfirmDelete from "../../../common/components/ConfirmDelete";
import { useDatabase } from "../../../common/hooks/useDatabase";
import ExportQuestionsButton from "../components/ExportQuestionsButton";
import ImportViewer from "../components/ImportViewer";
import QuestionCard from "../components/QuestionCard";
import QuestionForm from "../components/QuestionForm";
import QuestionsTable from "../components/QuestionsTable";
import { Box } from "@mui/system";






export default function QuestionsPage() {
    const { addQuestion, addQuestionsBatch, getQuestionsComplete, deleteQuestion, addExamQuestion: addQuestionToExam, exams } = useDatabase();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<QuestionFilters>();



    useEffect(() => {
        loadQuestions();
    }, [filters]);

    const loadQuestions = async () => {
        try {
            console.log("Loading Questions", filters)
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

    const handleFilterChange = (key: string, value: any) => {
        console.log(value)
        setFilters((prev) => ({ ...prev, [key]: value }))
        // loadQuestions();
    }






    return (
        <>
            <QuestionForm onSubmit={handleSubmit} />
            <ImportViewer onSubmit={handleImport} />
            <ExportQuestionsButton questionIds={selectedIds} />
            <ConfirmDelete
                onConfirmDelete={handleDeleteQuestions}
                buttonText="Delete Selected"
                message={`Are you sure you want to delete this question? This will remove it from all exam associations! This action cannot be undone!`}
                disabled={!selectedIds.length}
            />

            {/* <Box sx={{
                columns: { xs: 1, sm: 2, md: 3, lg: 4 }, // Responsive column count
                columnGap: 2,
                padding: 2
            }}>
                {questions.map(question => (
                    <QuestionCard
                        key={question.question_id}
                        question={question}
                        sx={{
                            breakInside: 'avoid', // Prevent cards from breaking across columns
                            marginBottom: 2,
                            width: '100%'
                        }}
                    />
                ))}
            </Box> */}

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