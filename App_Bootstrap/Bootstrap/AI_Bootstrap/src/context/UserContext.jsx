// src/context/UserContext.js

import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserFromApi = async () => {
      const token = localStorage.getItem('user_token')
      if (token) {
        try {
          const response = await axios.get(
            'http://localhost:3000/api/auth/profile',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          setUser(response.data)
        } catch (error) {
          console.error('Failed to fetch user', error)
          localStorage.removeItem('user_token')
        }
      }
      setLoading(false)
    }

    fetchUserFromApi()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  )
}