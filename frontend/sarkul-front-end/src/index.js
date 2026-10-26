import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UIVersionProvider, useUIVersion } from './contexts/UIVersionContext';
import theme from './theme/theme';
import ModernApp from './ModernApp'; // To be created

import ModernLogin from './components-v2/Login/Login';

console.log("added latest");

const RootComponent = () => {
  const { uiVersion } = useUIVersion();
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    return <ModernLogin />;
  }

  return uiVersion === 'classic' ? <App /> : <ModernApp />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UIVersionProvider>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <RootComponent />
      </BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </ThemeProvider>
  </UIVersionProvider>
);
