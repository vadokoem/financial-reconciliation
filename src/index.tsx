import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

async function prepare() {
    if (process.env.NODE_ENV === 'development') {
        const { worker } = await import('./mocks/browser');
        return worker.start({
            onUnhandledRequest: 'bypass',
        });
    }
    return Promise.resolve();
}

prepare().then(() => {
    const container = document.getElementById('root');
    if (!container) throw new Error('Failed to find the root element');
    const root = createRoot(container);
    
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
});