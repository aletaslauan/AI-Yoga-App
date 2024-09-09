import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CgMenuRound } from 'react-icons/cg'
import { IoLogOutOutline } from 'react-icons/io5'
import { AdminContext } from '../context/AdminContext'
import { UserContext } from '../context/UserContext'
import '../styles/burgerMenu.scss'

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { admin, setAdmin } = useContext(AdminContext)
  const { user, setUser } = useContext(UserContext)
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    if (user && user.photo_url) {
      setPhotoUrl(
        `http://localhost:3000${user.photo_url}?${new Date().getTime()}`
      )
    }
  }, [user])

  const handleLogout = async () => {
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('user_token')

    if (!token) {
      console.error('You are not logged in!')
      return
    }

    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      localStorage.removeItem('admin_token')
      localStorage.removeItem('user_token')
      setAdmin(null)
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  // Close the menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !event.target.closest('.menu-content') &&
        !event.target.closest('.burger-icon')
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="burger-menu">
      <CgMenuRound className="burger-icon" onClick={() => setIsOpen(!isOpen)} />
      <div className={`menu-content ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <CgMenuRound
            className="burger-icon"
            onClick={() => setIsOpen(false)}
          />
        </div>
        <Link
          to={admin ? '/admin' : '/dashboard'}
          className="bm-item"
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link to="/ai" className="bm-item" onClick={() => setIsOpen(false)}>
          AI
        </Link>
        <Link
          to="/activity"
          className="bm-item"
          onClick={() => setIsOpen(false)}
        >
          Activity
        </Link>
        {!admin && (
          <Link
            to="/profile"
            className="bm-item"
            onClick={() => setIsOpen(false)}
          >
            User Profile
            <img src={photoUrl} alt="User" className="user-circle" />
          </Link>
        )}
        <Link
          to="/settings"
          className="bm-item"
          onClick={() => setIsOpen(false)}
        >
          Settings
        </Link>
        {admin && (
          <Link
            to="/admin"
            className="bm-item"
            onClick={() => setIsOpen(false)}
          >
            Admin
          </Link>
        )}
        <button id="logout" className="bm-item" onClick={handleLogout}>
          <IoLogOutOutline />
          Logout
        </button>
      </div>
    </div>
  )
}

export default BurgerMenu
