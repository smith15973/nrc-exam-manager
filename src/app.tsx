// src/App.tsx
import { createRoot } from 'react-dom/client';
import PlantPage from './components/pages/PlantPage';
import DrawerAppBar from './components/common/DrawerAppbar';
import HomePage from './components/pages/HomePage';


const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<>
        <DrawerAppBar />
        <HomePage />
        <PlantPage plantId={1} />
    </>);
}