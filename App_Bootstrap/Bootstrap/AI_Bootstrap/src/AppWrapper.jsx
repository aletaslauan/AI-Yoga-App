// src/AppWrapper.jsx
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminProvider } from './context/AdminContext'
import App from './App'

const AppWrapper = () => {
  return (
    <ThemeProvider>
      <AdminProvider>
        <UserProvider>
          <Router>
            <App />
          </Router>
        </UserProvider>
      </AdminProvider>
    </ThemeProvider>
  )
}

export default AppWrapper
