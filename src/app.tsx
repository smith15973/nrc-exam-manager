// src/app.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Plants from './components/Plants';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<>
        <Plants />
    </>);
}