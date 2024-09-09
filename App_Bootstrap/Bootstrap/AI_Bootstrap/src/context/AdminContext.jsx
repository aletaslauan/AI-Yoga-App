import React, { createContext, useState } from 'react'

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}
