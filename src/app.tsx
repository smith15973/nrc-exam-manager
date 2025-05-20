// src/App.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import PlantPage from './components/pages/PlantPage';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<>
        <PlantPage />
    </>);
}