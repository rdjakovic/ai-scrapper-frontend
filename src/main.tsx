import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryProvider } from './providers/QueryProvider.tsx';
import { ToastProvider } from './providers/ToastProvider.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './styles/index.css';

// Create toast container in the DOM
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
