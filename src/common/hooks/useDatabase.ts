// useDatabase.ts
import { usePlants } from './usePlants';
import { useExams } from './useExams';
import { useQuestions } from './useQuestions';

export const useDatabase = () => {
    const plantsHook = usePlants();
    const examsHook = useExams();
    const questionsHook = useQuestions();

    return {
        // Spread all functions and state from each hook
        ...plantsHook,
        ...examsHook,
        ...questionsHook,

        // If you want to namespace errors to avoid conflicts:
        errors: {
            plants: plantsHook.error,
            exams: examsHook.error,
            questions: questionsHook.error
        }
    };
};