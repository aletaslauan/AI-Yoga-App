import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../styles/settings.scss'
import BurgerMenu from '../components/BurgerMenu'
import ThemeSelector from '../components/ThemeSelector'
import { ThemeContext } from '../context/ThemeContext'

const Settings = () => {
  // const [isDarkMode, setIsDarkMode] = useState(() => {
  //   const savedMode = localStorage.getItem('darkMode')
  //   return savedMode === 'true'
  // })
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const savedNotifications = localStorage.getItem('notificationsEnabled')
    return savedNotifications === 'true'
  })
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(() => {
    const savedReminders = localStorage.getItem('dailyRemindersEnabled')
    return savedReminders === 'true'
  })
  const { theme, setTheme } = useContext(ThemeContext)

  // useEffect(() => {
  //   if (isDarkMode) {
  //     localStorage.setItem('previousTheme', theme)
  //     document.documentElement.setAttribute('data-theme', 'dark')
  //     localStorage.setItem('darkMode', 'true')
  //   } else {
  //     const previousTheme = localStorage.getItem('previousTheme') || 'light'
  //     document.documentElement.setAttribute('data-theme', previousTheme)
  //     localStorage.setItem('darkMode', 'false')
  //   }
  // }, [isDarkMode, theme])

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled)
  }, [notificationsEnabled])

  useEffect(() => {
    localStorage.setItem('dailyRemindersEnabled', dailyRemindersEnabled)
  }, [dailyRemindersEnabled])

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev)
  }

  const toggleDailyReminders = () => {
    setDailyRemindersEnabled((prev) => !prev)
  }

  const navigate = useNavigate()

  return (
    <div className="settings-container">
      <BurgerMenu />
      <div className="title_container">
        <h2>Settings</h2>
        <button
          type="button"
          className="close-settings"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="settings">
        <ThemeSelector />
        {/* <label className="set">
          <p>Dark Mode</p>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
        </label> */}
        <label className="set">
          <p>Notifications</p>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={toggleNotifications}
          />
        </label>
        <label className="set">
          <p>Daily Reminders</p>
          <input
            type="checkbox"
            checked={dailyRemindersEnabled}
            onChange={toggleDailyReminders}
          />
        </label>
      </div>
    </div>
  )
}

export default Settings
