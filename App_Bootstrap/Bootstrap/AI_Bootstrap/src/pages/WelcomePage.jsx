// src/pages/WelcomePage.jsx
import { useNavigate } from 'react-router-dom'
import { AiOutlineUser, AiOutlineUserAdd } from 'react-icons/ai'
import yoga from '/src/assets/images/yoga.jpg'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/WelcomePage.scss'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <div
      className="page-wrapper d-flex flex-column justify-content-center align-items-center text-center w-100"
      style={{ backgroundImage: `url(${yoga})` }}
    >
      <div className="title mb-4">
        <h1>AI Pose Tracking</h1>
      </div>
      <div className="button-container d-flex">
        <button
          className="btn btn-primary me-3 d-flex align-items-center"
          onClick={() => navigate('/login')}
        >
          <AiOutlineUser className="me-2" />
          <p className="mb-0">Log In</p>
        </button>
        <button
          className="btn btn-secondary d-flex align-items-center"
          onClick={() => navigate('/register')}
        >
          <AiOutlineUserAdd className="me-2" />
          <p className="mb-0">Register</p>
        </button>
      </div>
    </div>
  )
}

export default WelcomePage
