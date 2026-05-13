// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ✅ Import axios and configure it ONCE for the entire app
import axios from 'axios';

// ✅ CRITICAL FIX: Configure axios globally
axios.defaults.withCredentials = true;  // Send cookies with every request
axios.defaults.baseURL = 'http://localhost:5000';  // Optional: set base URL

// Now ALL axios requests in your entire app will:
// 1. Include cookies automatically
// 2. Use the base URL (so you can use "/get_vendor" instead of "http://localhost:5000/get_vendor")

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
