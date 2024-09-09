// src/components/Navbar.jsx
import React, { useContext } from 'react'
import { FiActivity } from 'react-icons/fi'
import ai from '/src/assets/icons/ai.png'
import { AiOutlineHome } from 'react-icons/ai'
import { NavLink } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import BurgerMenu from './BurgerMenu'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/navbar.scss'

const Navbar = () => {
  const { admin } = useContext(AdminContext)

  return (
    <nav className="navbar fixed-top navbar-expand-lg">
      <div className="container-fluid justify-content-between">
        <BurgerMenu />
        <div className="navbar-nav mx-auto">
          <NavLink
            to={admin ? '/admin' : '/dashboard'}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <AiOutlineHome className="me-2" />
            Home
          </NavLink>
          <NavLink
            to="/ai"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <img src={ai} alt="AI" className="navbar-icon me-2" />
            AI
          </NavLink>
          <NavLink
            to="/activity"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <FiActivity className="me-2" />
            Activity
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
