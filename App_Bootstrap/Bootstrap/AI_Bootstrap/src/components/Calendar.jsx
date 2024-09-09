// src/components/Calendar.jsx

import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import '../styles/calendar.scss'

const Calendar = ({ user_id }) => {
  const [progressData, setProgressData] = useState({})
  const [currentDate, setCurrentDate] = useState(new Date()) // Setăm data curentă

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/progress/${user_id}`
        )
        console.log('Fetched progress data:', response.data)

        if (Array.isArray(response.data)) {
          const progressDict = response.data.reduce((acc, curr) => {
            const formattedDate = new Date(curr.date)
              .toISOString()
              .split('T')[0] // Extract the date part
            if (!acc[formattedDate]) {
              acc[formattedDate] = []
            }
            acc[formattedDate].push(curr)
            return acc
          }, {})

          setProgressData(progressDict)
        } else {
          console.error('Expected an array but got:', response.data)
          setProgressData({})
        }
      } catch (error) {
        console.error('Error fetching progress data:', error)
        setProgressData({})
      }
    }

    fetchProgressData()
  }, [user_id])

  const getDayClassName = (date) => {
    const formattedDate = date.toISOString().split('T')[0] // Convert to 'YYYY-MM-DD'
    const isToday = formattedDate === currentDate.toISOString().split('T')[0] // Verificăm dacă este data curentă

    let className = 'calendar-day'
    if (progressData[formattedDate]) {
      className += ' has-progress'
    }
    if (isToday) {
      className += ' today' // Adăugăm o clasă specială pentru ziua curentă
    }
    return className
  }

  // Zilele săptămânii încep cu luni
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const generateCalendarDays = useMemo(() => {
    const days = []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    // Calculăm ziua săptămânii în care începe luna, ajustând pentru săptămână care începe luni
    let startDayOfWeek = startDate.getDay()
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Transformăm duminica (0) în ultima poziție (6)

    // Adăugăm celule goale până la prima zi a lunii
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Generăm zilele lunii
    while (startDate <= endDate) {
      days.push(
        <div
          key={startDate.toISOString()}
          className={getDayClassName(startDate)}
        >
          {startDate.getDate()}
        </div>
      )
      startDate.setDate(startDate.getDate() + 1)
    }

    return days
  }, [progressData, currentDate])

  return (
    <div className="calendar-container mb-4">
      {/* Afișăm titlul și data curentă */}
      <h3>Progress Calendar - {currentDate.toLocaleDateString('en-GB')}</h3>
      <div className="calendar mt-3">
        {/* Afișăm zilele săptămânii */}
        <div className="calendar-weekdays">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>
        {/* Afișăm zilele lunii */}
        <div className="calendar-days">{generateCalendarDays}</div>
      </div>
    </div>
  )
}

export default Calendar