// src/App.tsx
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PlantPage from '../features/plants/pages/PlantPage';
import DrawerAppBar from '../common/components/DrawerAppbar';
import HomePage from '../pages/HomePage';
import { CssBaseline } from '@mui/material';
import ExamsPage from '../features/exams/pages/ExamsPage';
import ExamPage from '../features/exams/pages/ExamPage';
import QuestionsPage from '../features/questions/pages/QuestionsPage';
import PlantsPage from '../features/plants/pages/PlantsPage';
import QuestionPage from '../features/questions/pages/QuestionPage';




const App = () => {
    return (
        <HashRouter>
            <DrawerAppBar />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/plants' element={<PlantsPage />} />
                <Route path='/plants/:plantId' element={<PlantPage />} />
                <Route path='/exams/' element={<ExamsPage />} />
                <Route path='/exams/:examId' element={<ExamPage />} />
                <Route path='/questions' element={<QuestionsPage />} />
                <Route path='/questions/:questionId' element={<QuestionPage />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </HashRouter>
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
