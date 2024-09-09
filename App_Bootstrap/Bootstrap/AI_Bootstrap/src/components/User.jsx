// src/components/User.jsx
import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/user.scss'

const User = () => {
  const { user, loading } = useContext(UserContext)

  if (loading) return <div className="loading">Loading...</div>

  if (!user) return <div className="access-denied">Access Denied</div>

  return (
    <div className="container user-page">
      <h2 className="my-4">User Page</h2>
      <p>Welcome, {user.name}!</p>
    </div>
  )
}

export default User
