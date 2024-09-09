import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import '../styles/metrics.scss'

const Metrics = ({ user_id }) => {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/progress/${user_id}`
        )
        setMetrics(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching metrics data:', error)
        setMetrics([]) // Fallback to an empty array if there's an error
      }
    }

    // Initial fetch
    fetchMetricsData()

    // Polling interval (e.g., every 10 seconds)
    const intervalId = setInterval(fetchMetricsData, 10000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [user_id])

  // Function to convert seconds to minutes
  const convertSecondsToMinutes = (seconds) => {
    return Math.floor(seconds / 60) // Convert seconds to full minutes
  }

  // Calculate total progress in minutes for a given metric
  const calculateProgressInMinutes = (metricName) => {
    if (!Array.isArray(metrics)) return 0
    const metric = metrics.filter((m) => m.metric === metricName)
    const totalValueInSeconds = metric.reduce((sum, m) => sum + m.value, 0)
    return convertSecondsToMinutes(totalValueInSeconds) // Convert to minutes
  }

  // Calculate total calories burned from all activities
  const calculateTotalCaloriesBurned = () => {
    if (!Array.isArray(metrics)) return 0
    const totalCalories = metrics
      .filter((m) => m.metric === 'calories_burned')
      .reduce((sum, m) => sum + m.value, 0)
    return totalCalories // Return total calories burned
  }

  return (
    <div className="metrics-container">
      <h3>Your Progress</h3>
      <div className="row">
        <div className="progress-item col-md-6">
          <h4 className="progress-item-title">Duration Progress</h4>
          <CircularProgressbar
            value={calculateProgressInMinutes('duration')} // Display only the minutes part
            text={`${calculateProgressInMinutes('duration')} min`} // Display full duration in minutes
            styles={buildStyles({
              textColor: '#fff',
              pathColor: '#6a1b9a',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
        <div className="progress-item col-md-6">
          <h4 className="progress-item-title">Total Calories Burned</h4>
          <CircularProgressbar
            value={calculateTotalCaloriesBurned()}
            text={`${calculateTotalCaloriesBurned()} kcal`} // Display total calories burned
            styles={buildStyles({
              textColor: '#fff',
              pathColor: '#3e98c7',
              trailColor: '#d6d6d6',
            })}
          />
        </div>
      </div>
    </div>
  )
}

export default Metrics