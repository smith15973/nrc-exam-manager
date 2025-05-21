// src/App.tsx
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PlantPage from './components/pages/PlantPage';
import DrawerAppBar from './components/common/DrawerAppbar';
import HomePage from './components/pages/HomePage';
import { CssBaseline } from '@mui/material';




const App = () => {
    return (
        <HashRouter>
            <DrawerAppBar />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/plants/:plantId' element={<PlantPage />} />
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