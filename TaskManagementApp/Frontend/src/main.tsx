import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to mount React app:', error);
  const fallbackElement = document.createElement('div');
  fallbackElement.innerHTML = '<h1>Application Error</h1><p>Please refresh the page</p>';
  document.body.appendChild(fallbackElement);
}
