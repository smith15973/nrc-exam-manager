// useDatabase.ts
import { usePlants } from './usePlants';
import { useExams } from './useExams';
import { useQuestions } from './useQuestions';
import { useSystems } from './useSystems';
import { useStems } from './useStems';
import { useKas } from './useKas';
import { useSystemKas } from './useSystemKas';

export const useDatabase = () => {
    const plantsHook = usePlants();
    const examsHook = useExams();
    const questionsHook = useQuestions();
    const systemsHook = useSystems();
    const systemKasHook = useSystemKas();
    const stemsHook = useStems();
    const kasHook = useKas();

    return {
        // Spread all functions and state from each hook
        ...plantsHook,
        ...examsHook,
        ...questionsHook,
        ...systemsHook,
        ...systemKasHook,
        ...stemsHook,
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