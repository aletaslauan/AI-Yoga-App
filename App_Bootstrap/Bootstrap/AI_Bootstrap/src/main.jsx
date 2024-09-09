// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './AppWrapper'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import './styles/themes.scss'
import './styles/activity.scss'

const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  document.documentElement.className = `theme-${savedTheme}`
} else {
  document.documentElement.className = 'theme-default'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)
