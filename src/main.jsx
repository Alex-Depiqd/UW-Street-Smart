/* Street Smart: local-only campaign tracking app.
   No user credentials, banking, or personal data collected.
   See /privacy.html for details. */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 

// Remove the HTML loading screen once React has mounted (with a fallback)
const hideLoading = () => {
  const loading = document.querySelector('.loading-screen');
  if (loading && loading.parentElement) {
    console.log('Removing loading screen');
    loading.parentElement.removeChild(loading);
  }
};

// Try immediately and after a short delay as a fallback
console.log('React mounted, attempting to hide loading screen');
hideLoading();
setTimeout(() => {
  console.log('Fallback: hiding loading screen after 1s');
  hideLoading();
}, 1000);