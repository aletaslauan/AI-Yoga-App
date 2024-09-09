import { useState, useContext, useRef, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { UserContext } from '../context/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { AiOutlineUser } from 'react-icons/ai'
import Popup from '../components/Popup'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/login.scss'

const LogIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setAdmin } = useContext(AdminContext)
  const { setUser } = useContext(UserContext)
  const [popup, setPopup] = useState({ show: false, title: '', message: '' })
  const emailInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    emailInputRef.current.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      console.log('Attempting admin login')
      const adminResponse = await axios.post(
        'http://localhost:3000/api/admin/login',
        { email, password }
      )
      const { token } = adminResponse.data

      console.log('Admin login successful', adminResponse)
      localStorage.setItem('admin_token', token)

      const adminProfileResponse = await axios.get(
        'http://localhost:3000/api/admin/profile',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setAdmin(adminProfileResponse.data) // Update the context with admin data
      navigate('/admin')
      return
    } catch (error) {
      console.log('Admin login failed:', error)
    }

    try {
      console.log('Attempting user login')
      const userResponse = await axios.post(
        'http://localhost:3000/api/auth/login',
        { email, password }
      )
      const { token } = userResponse.data

      console.log('User login successful', userResponse)
      localStorage.setItem('user_token', token)

      const userProfileResponse = await axios.get(
        'http://localhost:3000/api/auth/profile',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setUser(userProfileResponse.data)
      navigate('/start')
    } catch (error) {
      console.error('User login failed:', error)
      setPopup({
        show: true,
        title: 'Login failed',
        message: error.response?.data?.error || 'Unknown error',
      })
    }
  }

  const closePopup = () => {
    setPopup({ show: false, title: '', message: '' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="container login-container d-flex justify-content-center align-items-center">
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
        />
      )}
      <form onSubmit={handleSubmit} className="login-form p-4 rounded shadow">
        <div className="icon-container mb-4 d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => navigate('/')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Log In</h2>
          <AiOutlineUser className="user-icon" />
        </div>
        <div className="mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            onKeyDown={handleKeyDown}
            className="form-control"
            ref={emailInputRef} // Set the ref here
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            onKeyDown={handleKeyDown}
            className="form-control"
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">
          Log In
        </button>
      </form>
    </div>
  )
}

export default LogIn