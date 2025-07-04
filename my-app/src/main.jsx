// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProviderWithMode } from './theme';
import { ThemeProvider, CssBaseline } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProviderWithMode>
    {(theme) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    )}
  </ThemeProviderWithMode>
);
