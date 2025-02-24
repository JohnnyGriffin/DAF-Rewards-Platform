// src/index.js

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import theme from './theme';  // Updated to use our new theme

import ReactGA from 'react-ga';
ReactGA.initialize('YOUR_GA_TRACKING_ID');
ReactGA.pageview(window.location.pathname + window.location.search);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
