// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // .tsx
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render( // Added '!' for non-null assertion
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)