import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './app/ErrorBoundary.tsx';
import { installErrorTracking } from './app/error-tracker.ts';
import { installPwaHooks, registerServiceWorker } from './app/pwa.ts';

installErrorTracking();
installPwaHooks();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
