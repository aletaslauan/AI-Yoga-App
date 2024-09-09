// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import LogIn from './pages/LogIn'
import Register from './pages/Register'
import Start from './pages/Start'
import Dashboard from './pages/Dashboard'
import Activity from './pages/Activity'
import AI from './pages/AI'
import YogaPoseTracker from './pages/YogaPose'
import PoseExtractorPage from './pages/PoseExtractor'
//import SessionControl from './pages/SessionControl';
import UserProfile from './pages/UserProfile'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import User from './components/User'
import Navbar from './components/Navbar'
import { AdminContext } from './context/AdminContext'
import { UserContext } from './context/UserContext'
import { useContext } from 'react'

const App = () => {
  const location = useLocation()
  const noNavbarPaths = ['/login', '/register', '/', '/start']
  const { user, loading: userLoading } = useContext(UserContext)
  const { admin, loading: adminLoading } = useContext(AdminContext)

  if (userLoading || adminLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="main-content">
      {!noNavbarPaths.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/start" element={<Start />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/yogapose" element={<YogaPoseTracker />} />
        <Route path="/poseextractor" element={<PoseExtractorPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </div>
  )
}

export default App