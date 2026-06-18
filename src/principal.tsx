// src/principal.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Aplicacion from './Aplicacion';
import './index.css'; // Aquí vive Tailwind

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Aplicacion />
    </BrowserRouter>
  </StrictMode>
);