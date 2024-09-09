// src/pages/Start.jsx
import React, { useEffect } from 'react'
import ai from '/src/assets/icons/ai.png'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/start.scss'

const Start = () => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/dashboard')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStart()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="start-container d-flex flex-column justify-content-center align-items-center text-center">
      <div className="logo-section mb-4">
        <img src={ai} alt="Logo" className="logo img-fluid" />
      </div>
      <div className="text-section">
      <h1 className="mb-4">Welcome to your journey!</h1>
        <h4 className="mb-4">
          "Embark on the voyage of discovery, where every challenge is
          a new frontier"
        </h4>
        <button className="btn btn-primary" onClick={handleStart}>
          START NOW
        </button>
      </div>
    </div>
  )
}

export default Start
