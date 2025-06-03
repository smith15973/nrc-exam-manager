// useDatabase.ts
import { usePlants } from './usePlants';
import { useExams } from './useExams';
import { useQuestions } from './useQuestions';
import { useSystems } from './useSystems';
import { useKas } from './useKas';

export const useDatabase = () => {
    const plantsHook = usePlants();
    const examsHook = useExams();
    const questionsHook = useQuestions();
    const systemsHook = useSystems();
    const kasHook = useKas();

    return {
        // Spread all functions and state from each hook
        ...plantsHook,
        ...examsHook,
        ...questionsHook,
        ...systemsHook,
        ...kasHook,

        // If you want to namespace errors to avoid conflicts:
        errors: {
            plants: plantsHook.error,
            exams: examsHook.error,
            questions: questionsHook.error,
            systems: systemsHook.error,
            kas: kasHook.error,
        }
    };
};