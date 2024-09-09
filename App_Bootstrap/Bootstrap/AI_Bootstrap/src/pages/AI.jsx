// src/pages/AI.jsx
import { useState, useContext, useRef } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { FaPlay, FaPause } from 'react-icons/fa'
import 'bootstrap/dist/css/bootstrap.min.css'
import BurgerMenu from '../components/BurgerMenu'
import YogaPoseTracker from '../components/YogaPoseTracker'
import image from '../assets/images/yoga_pose_9_1.jpg'

import '../styles/ai.scss'

const AI = ({ user_id }) => {
  const { user, loading } = useContext(UserContext) // Access user and loading state from context
  const [sessionId, setSessionId] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeDuration, setActiveDuration] = useState(0) // Tracks active time excluding pauses
  const [caloriesBurned, setCaloriesBurned] = useState(0)
  const intervalRef = useRef(null)
  const lastPausedTime = useRef(null) // To track when the session was last paused
  const accumulatedPauseDuration = useRef(0) // To track total paused duration

  if (loading) {
    return <div>Loading...</div> // Display loading state
  }

  if (!user) {
    return <div>Please log in to start a session.</div> // Ensure user is logged in
  }

  // Function to start the session
  const startSession = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/sessions/start',
        { user_id: user.user_id }
      )
      setSessionId(response.data.session_id)
      setIsRunning(true)
      setActiveDuration(0)
      setCaloriesBurned(0)

      // Start the timer for active duration
      intervalRef.current = setInterval(() => {
        setActiveDuration((prevDuration) => prevDuration + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  // Function to pause the session (without finishing it)
  const pauseSession = async () => {
    if (isRunning) {
      clearInterval(intervalRef.current)
      setIsRunning(false)
      lastPausedTime.current = Date.now() // Record the time when the session was paused

      try {
        await axios.post('http://localhost:3000/api/sessions/pause', {
          session_id: sessionId,
        })
      } catch (error) {
        console.error('Error pausing session:', error)
      }
    }
  }

  // Function to resume the session
  const resumeSession = async () => {
    if (sessionId) {
      try {
        await axios.put('http://localhost:3000/api/sessions/resume', {
          session_id: sessionId,
        })

        // Calculate how long the session was paused
        const pausedDuration = Math.floor(
          (Date.now() - lastPausedTime.current) / 1000
        )
        accumulatedPauseDuration.current += pausedDuration

        // Start the timer again from where it was paused
        setIsRunning(true)
        intervalRef.current = setInterval(() => {
          setActiveDuration((prevDuration) => prevDuration + 1)
        }, 1000)
      } catch (error) {
        console.error('Error resuming session:', error)
      }
    }
  }

  // Function to stop and finish the session
  const finishSession = async () => {
    if (!sessionId) return
    try {
      // Stop the timer
      clearInterval(intervalRef.current)
      setIsRunning(false)

      // Get the category_id from user context or some other way
      const category_id = user.category_id || 3 // Example: 3 is for a specific activity, adjust as needed

      // Send data to the backend to finish the session
      const response = await axios.put(
        'http://localhost:3000/api/sessions/finish',
        {
          session_id: sessionId,
          category_id: category_id, // Pass the category_id to backend
          user_id: user.user_id, // Pass the user_id to backend
        }
      )

      // Update calories burned based on the response from the backend
      setCaloriesBurned(response.data.calories_burned)

      // Reset session state
      setSessionId(null)
    } catch (error) {
      console.error('Error finishing session:', error)
    }
  }

  // Toggle between play and pause
  const toggleSession = () => {
    if (isRunning) {
      pauseSession()
    } else if (sessionId) {
      resumeSession()
    } else {
      startSession()
    }
  }

  return (
    <div className="container-fluid ai-container gap-1">
      <BurgerMenu />
      <div className="control">
        <h3>Get started when ready:</h3>
        <div className="button-group d-flex align-items-center justify-content-around mb-3">
          <button
            className="btn play-btn  btn-primary d-flex align-items-center justify-content-center btn-lg w-50 me-1"
            onClick={toggleSession}
          >
            {isRunning ? <FaPause /> : <FaPlay />} {/* Play/Pause Icon */}
          </button>
          <button
            className="btn finish-btn  btn-primary  d-flex py-4 align-items-center justify-content-center btn-lg w-50 me-1"
            onClick={finishSession}
            disabled={!sessionId}
          >
            Finish
          </button>
        </div>
        <h4>
          Duration: {Math.floor(activeDuration / 60)} min{' '}
          {Math.floor(activeDuration % 60)} sec
        </h4>
        <h4>Calories Burned: {caloriesBurned}</h4>
      </div>
      <div className="tracker">
        <YogaPoseTracker />
      </div>
      <div className="images d-flex align-items-center justify-content-center">
        <img src={image} alt="" />
      </div>
    </div>
  )
}

export default AI