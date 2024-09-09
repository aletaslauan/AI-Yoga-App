// src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from 'react'
import { FaRegHeart } from 'react-icons/fa'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { FaGreaterThan } from 'react-icons/fa'
import 'react-circular-progressbar/dist/styles.css'
import Calendar from '../components/Calendar'
import Metrics from '../components/Metrics'
import BurgerMenu from '../components/BurgerMenu'
import { UserContext } from '../context/UserContext'
import '../styles/dashboard.scss'

const Dashboard = () => {
  const { user } = useContext(UserContext)
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    if (user && user.photo_url) {
      setPhotoUrl(
        `http://localhost:3000${user.photo_url}?${new Date().getTime()}`
      )
    }
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <BurgerMenu />
      <div className="greet-container mb-4">
        <div className="title-container">
          <h3 className="title">Hello, {user.name}</h3>
        </div>
        <p className="paragraph">Ready for training today?</p>
      </div>
      <div className="user-container mb-4">
        <img src={photoUrl} alt="User" className="rounded-circle" />
        <p>Always aim higher</p>
      </div>
      <div className="daily-remainder-container mb-4">
        <div className="text-container fst-italic">
          Never forget that you look great and that you are special!
        </div>
        <div className="daily-container d-flex align-items-center justify-content-between">
          <p className="mb-0">-Daily reminders</p>
          <div className="heart-container ms-2">
            <FaRegHeart />
          </div>
        </div>
      </div>
      <div className="training-container d-flex flex-column align-items-center ">
        <div className="calendar d-flex align-items-center justify-content-center">
          <Calendar user_id={user.user_id} />
        </div>
        <div className="progress-container d-flex  justify-content-between">
          <div className="progress-item text-center"></div>
          <div className="progress-item text-center">
            <Metrics user_id={user.user_id} />
          </div>
        </div>
      </div>
      <div className="photo-container">
        <div className="filter-container"></div>
      </div>
    </div>
  )
}

export default Dashboard