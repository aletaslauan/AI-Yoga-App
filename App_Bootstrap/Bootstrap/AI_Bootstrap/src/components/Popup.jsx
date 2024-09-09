import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/popup.scss'
import { useLocation, useNavigate } from 'react-router-dom'

const Popup = ({ title, message, onClose }) => {
  const [isClose, setIsClose] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Enter') {
      setIsClose(true)
    }
  }

  const handleOkClick = () => {
    setIsClose(true)
  }

  if (isClose) {
    onClose() // Call the onClose function to navigate back to the previous page
    return null
  }

  return (
    <div className="popup-overlay d-flex align-items-center justify-content-center">
      <div className="popup bg-light p-4 rounded shadow">
        <h2>{title}</h2>
        <p>{message}</p>
        <button className="btn btn-primary" onClick={handleOkClick}>
          OK
        </button>
      </div>
    </div>
  )
}

export default Popup
