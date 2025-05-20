// src/app.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Test from './components/Test';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<>
        <Test />
    </>);
}