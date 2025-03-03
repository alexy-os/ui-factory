import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './semantic.css';

// Create root element if it doesn't exist
let rootElement = document.getElementById('root');
if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Add basic styling
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.fontFamily = 'system-ui, sans-serif';

// Render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 