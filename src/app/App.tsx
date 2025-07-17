// src/App.tsx
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import PlantPage from '../features/plants/pages/PlantPage';
import DrawerAppBar from '../common/components/DrawerAppbar';
import HomePage from '../pages/HomePage';
import { CssBaseline } from '@mui/material';
import ExamsPage from '../features/exams/pages/ExamsPage';
import ExamPage from '../features/exams/pages/ExamPage';
import QuestionsPage from '../features/questions/pages/QuestionsPage';
import PlantsPage from '../features/plants/pages/PlantsPage';
import QuestionPage from '../features/questions/pages/QuestionPage';
import SystemPage from '../features/systems/pages/SystemPage';
import SystemsPage from '../features/systems/pages/SystemsPage';
import KasPage from '../features/kas/pages/KasPage';
import KaPage from '../features/kas/pages/KaPage';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import SandboxPage from '../pages/SandboxPage';
import StemPage from '../features/stems/pages/StemPage';
import StemsPage from '../features/stems/pages/StemsPage';
import SystemKasPage from '../features/system_kas/pages/SystemKasPage';
import SystemKaPage from '../features/system_kas/pages/SystemKaPage';
import ExamQuestionPage from '../features/examsQuestions/pages/ExamQuestionPage';
import ExamQuestionsPage from '../features/examsQuestions/pages/ExamQuestionsPage';



const AppContent = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <>
            {!isHomePage && <DrawerAppBar />}
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/plants' element={<PlantsPage />} />
                <Route path='/plants/:plantId' element={<PlantPage />} />
                <Route path='/exams/' element={<ExamsPage />} />
                <Route path='/exams/:examId' element={<ExamPage />} />
                <Route path='/exams/:examId/questions' element={<ExamQuestionsPage />} />
                <Route path='/exams/:examId/questions/:questionId' element={<ExamQuestionPage />} />
                <Route path='/questions' element={<QuestionsPage />} />
                <Route path='/questions/:questionId' element={<QuestionPage />} />
                <Route path='/systems' element={<SystemsPage />} />
                <Route path='/systems/:systemNum' element={<SystemPage />} />
                <Route path='/stems' element={<StemsPage />} />
                <Route path='/stems/:stemId' element={<StemPage />} />
                <Route path='/kas' element={<KasPage />} />
                <Route path='/kas/:kaNum' element={<KaPage />} />
                <Route path='/system_kas' element={<SystemKasPage />} />
                <Route path='/system_kas/:system_kaNum' element={<SystemKaPage />} />
                <Route path='/sandbox' element={<SandboxPage />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <DialogsProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </DialogsProvider>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<>
        <CssBaseline>
            <App />
        </CssBaseline>
    </>);
}
