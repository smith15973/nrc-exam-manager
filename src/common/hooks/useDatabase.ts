// useDatabase.ts
import { usePlants } from './usePlants';
import { useExams } from './useExams';
import { useQuestions } from './useQuestions';
import { useSystems } from './useSystems';
import { useStems } from './useStems';
import { useKas } from './useKas';
import { useSystemKas } from './useSystemKas';
import { useExamQuestions } from './useExamQuestions';

export const useDatabase = () => {
    const plantsHook = usePlants();
    const examsHook = useExams();
    const questionsHook = useQuestions();
    const systemsHook = useSystems();
    const systemKasHook = useSystemKas();
    const stemsHook = useStems();
    const kasHook = useKas();
    const examQuestions = useExamQuestions();

    return {
        // Spread all functions and state from each hook
        ...plantsHook,
        ...examsHook,
        ...questionsHook,
        ...systemsHook,
        ...systemKasHook,
        ...stemsHook,
        ...kasHook,
        ...kasHook,
        ...examQuestions,
    };
};