import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import '../styles/themeSelector.scss'

const ThemeSelector = () => {
  const { setTheme } = useContext(ThemeContext)
  const [selectedTheme, setSelectedTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setSelectedTheme(savedTheme)
  }, [])

  const changeTheme = (e) => {
    const selectedTheme = e.target.value
    document.documentElement.setAttribute('data-theme', selectedTheme)
    localStorage.setItem('theme', selectedTheme)
    localStorage.setItem('previousTheme', selectedTheme)
    setTheme(selectedTheme)
    setSelectedTheme(selectedTheme)
  }

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select">Select Theme:</label>
      <select id="theme-select" value={selectedTheme} onChange={changeTheme}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="yellow">Yellow</option>
        <option value="brown">Brown</option>
      </select>
    </div>
  )
}

export default ThemeSelector
