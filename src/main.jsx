import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Ensure any static splash content is cleared before mounting React
const rootEl = document.getElementById('root')
if (rootEl) {
  try { rootEl.innerHTML = '' } catch {}
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 

// Remove the HTML loading screen once React has mounted (with a fallback)
const hideLoading = () => {
  const loading = document.querySelector('.loading-screen');
  if (loading && loading.parentElement) {
    loading.parentElement.removeChild(loading);
  }
};

// Try immediately and after a short delay as a fallback
hideLoading();
setTimeout(hideLoading, 1000);