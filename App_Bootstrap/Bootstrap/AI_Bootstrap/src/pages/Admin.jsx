import { useEffect, useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { AiOutlineUserAdd } from 'react-icons/ai'
import { GrView } from 'react-icons/gr'
import { GrEdit } from 'react-icons/gr'
import { RiDeleteBin5Line } from 'react-icons/ri'
import axios from 'axios'
import BurgerMenu from '../components/BurgerMenu'
import Modal from '../components/Modal'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/admin.scss'

const Admin = () => {
  const { admin, setAdmin } = useContext(AdminContext)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    gender: '',
    fitness_level: '',
    goals: '',
    health_conditions: '',
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try {
          const response = await axios.get(
            'http://localhost:3000/api/admin/profile',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          setAdmin(response.data)
        } catch (error) {
          console.error('Failed to fetch admin data:', error)
        }
      }
    }

    const fetchUsers = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try {
          const response = await axios.get(
            'http://localhost:3000/api/admin/users',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          setUsers(response.data)
        } catch (error) {
          console.error('Failed to fetch users:', error)
        }
      }
    }

    if (!admin) {
      fetchAdminData()
    }
    fetchUsers()
  }, [admin, setAdmin])

  useEffect(() => {
    if (selectedUser && selectedUser.photo_url) {
      setPhotoUrl(
        `http://localhost:3000${selectedUser.photo_url}?${new Date().getTime()}`
      )
    }
  }, [selectedUser])

  const handleViewUser = async (id) => {
    const token = localStorage.getItem('admin_token')
    try {
      const response = await axios.get(
        `http://localhost:3000/api/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSelectedUser(response.data)
      setIsEditing(false)
      setIsAdding(false)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsEditing(true)
    setIsAdding(false)
    setIsModalOpen(true)
  }

  const handleSaveUser = async () => {
    const token = localStorage.getItem('admin_token')
    const payload = {
      name: selectedUser.name,
      email: selectedUser.email,
      age: selectedUser.age,
      weight: selectedUser.weight,
      gender: selectedUser.gender,
      fitness_level: selectedUser.fitness_level,
      goals: selectedUser.goals,
      health_conditions: selectedUser.health_conditions,
      photo_url: selectedUser.photo_url,
    }
    console.log('Updating user with payload:', payload)
    try {
      const response = await axios.put(
        `http://localhost:3000/api/admin/users/${selectedUser.user_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      console.log('Update response:', response)
      const updatedUser = response.data
      setSelectedUser(updatedUser) // Update selectedUser with the latest data
      setIsEditing(false) // Exit editing mode, but keep the modal open
      // Update users list
      const updatedUsers = users.map((user) =>
        user.user_id === selectedUser.user_id ? updatedUser : user
      )
      setUsers(updatedUsers)
      // Update photoUrl state with a unique query string to force reload
      setPhotoUrl(`${updatedUser.photo_url}?${new Date().getTime()}`)
    } catch (error) {
      console.error(
        'Failed to update user:',
        error.response ? error.response.data : error.message
      )
      console.log('Full error response:', error)
    }
  }

  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem('admin_token')
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(users.filter((user) => user.user_id !== id))
      setIsDeleteConfirmOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleAddUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    const token = localStorage.getItem('admin_token')
    try {
      const response = await axios.post(
        'http://localhost:3000/api/admin/users',
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setUsers([...users, response.data])
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        weight: '',
        gender: '',
        fitness_level: '',
        goals: '',
        health_conditions: '',
      })
      setIsModalOpen(false)
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add user:', error)
    }
  }

  const handleChange = async (e) => {
    const { name, value, files } = e.target
    if (name === 'photo_url' && files[0]) {
      const formData = new FormData()
      formData.append('photo', files[0])
      formData.append('oldFilePath', selectedUser.photo_url)

      try {
        const response = await axios.post(
          'http://localhost:3000/api/upload',
          formData
        )
        const newPhotoUrl = response.data.filePath
        setSelectedUser((prevData) => ({
          ...prevData,
          photo_url: newPhotoUrl,
        }))
        setPhotoUrl(`${newPhotoUrl}?${new Date().getTime()}`)
      } catch (error) {
        console.error('Error uploading photo', error)
        alert('Error uploading photo')
      }
    } else {
      setSelectedUser((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleNewUserChange = (e) => {
    const { name, value } = e.target
    setNewUser((prevData) => ({
      ...prevData,
      [name]: value === null ? '' : value,
    }))
  }

  const openAddUserModal = () => {
    setIsAdding(true)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openDeleteConfirmModal = (user) => {
    setUserToDelete(user)
    setIsDeleteConfirmOpen(true)
  }

  const closeDeleteConfirmModal = () => {
    setUserToDelete(null)
    setIsDeleteConfirmOpen(false)
  }

  const [sortOrder, setSortOrder] = useState('asc') // initial sort order is ascending

  // Funcțiile de sortare
  const sortByName = () => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    })
    setUsers(sortedUsers)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') // toggle sort order
  }

  const sortByCreatedAt = () => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.created_at) - new Date(b.created_at)
      } else {
        return new Date(b.created_at) - new Date(a.created_at)
      }
    })
    setUsers(sortedUsers)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') // toggle sort order
  }

  const sortByUpdatedAt = () => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.updated_at) - new Date(b.updated_at)
      } else {
        return new Date(b.updated_at) - new Date(a.updated_at)
      }
    })
    setUsers(sortedUsers)
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') // toggle sort order
  }

  return (
    <div className="container-fluid admin-container">
      <BurgerMenu />
      <h1>Welcome, {admin?.username}</h1>
      <p>Email: {admin?.email}</p>
      <div className="header d-flex justify-content-between align-items-center">
        <h2>User List</h2>
        <button
          className="btn btn-lg btn-primary"
          onClick={openAddUserModal}
          title="Add User"
        >
          Add
          <AiOutlineUserAdd />
        </button>
      </div>
      <div className="d-flex btn-group-sm mb-1 gap-2">
        <button className="btn btn-secondary" onClick={sortByName}>
          Name
        </button>
        <button className="btn btn-secondary" onClick={sortByCreatedAt}>
          Created
        </button>
        <button className="btn btn-secondary" onClick={sortByUpdatedAt}>
          Updated
        </button>
      </div>
      <ul className="list-group">
        {users.map((user) => (
          <li
            key={user.user_id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <img
                src={`http://localhost:3000${
                  user.photo_url
                }?${new Date().getTime()}`}
                alt={user.name}
                className="img-thumbnail my-1 me-1"
                style={{ maxWidth: '40px', height: '40px' }}
              />
              {user.name} - {user.email}
            </div>
            <div className="button-group">
              <button
                className="btn btn-link"
                onClick={() => handleViewUser(user.user_id)}
                title="View User"
              >
                <GrView />
              </button>
              <button
                className="btn btn-link"
                onClick={() => handleEditUser(user)}
                title="Edit User"
              >
                <GrEdit />
              </button>
              <button
                className="btn delete-user btn-link"
                onClick={() => openDeleteConfirmModal(user)}
                title="Delete User"
              >
                <RiDeleteBin5Line />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isAdding && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Add New User</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddUser()
            }}
          >
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={handleNewUserChange}
                name="name"
                className="form-control w-75"
                required
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Email:</label>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleNewUserChange}
                name="email"
                className="form-control w-75"
                required
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Password:</label>
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={handleNewUserChange}
                name="password"
                className="form-control w-50"
                required
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Confirm Password:</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={newUser.confirmPassword}
                onChange={handleNewUserChange}
                name="confirmPassword"
                className="form-control w-50"
                required
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Age:</label>
              <input
                type="number"
                placeholder="Age"
                value={newUser.age}
                onChange={handleNewUserChange}
                name="age"
                className="form-control w-50"
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Weight:</label>
              <input
                type="number"
                placeholder="Weight"
                value={newUser.weight}
                onChange={handleNewUserChange}
                name="weight"
                className="form-control w-50"
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Gender:</label>
              <input
                type="text"
                placeholder="Gender"
                value={newUser.gender}
                onChange={handleNewUserChange}
                name="gender"
                className="form-control w-50"
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Fitness Level:</label>
              <input
                type="text"
                placeholder="Fitness Level"
                value={newUser.fitness_level}
                onChange={handleNewUserChange}
                name="fitness_level"
                className="form-control w-50"
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Health Conditions:</label>
              <input
                type="text"
                placeholder="Health Conditions"
                value={newUser.health_conditions}
                onChange={handleNewUserChange}
                name="health_conditions"
                className="form-control w-50"
              />
            </div>
            <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
              <label htmlFor="name">Goals:</label>
              <input
                type="text"
                placeholder="Goals"
                value={newUser.goals}
                onChange={handleNewUserChange}
                name="goals"
                className="form-control w-75"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Add User
            </button>
          </form>
        </Modal>
      )}
      {selectedUser && !isAdding && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>User Details</h2>
          {isEditing ? (
            <div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={selectedUser.name || ''}
                  onChange={handleChange}
                  placeholder="Name"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={selectedUser.email || ''}
                  onChange={handleChange}
                  placeholder="Email"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Age:</label>
                <input
                  type="number"
                  name="age"
                  value={selectedUser.age || ''}
                  onChange={handleChange}
                  placeholder="Age"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Weight:</label>
                <input
                  type="number"
                  name="weight"
                  value={selectedUser.weight || ''}
                  onChange={handleChange}
                  placeholder="Weight"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Gender:</label>
                <input
                  type="text"
                  name="gender"
                  value={selectedUser.gender || ''}
                  onChange={handleChange}
                  placeholder="Gender"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Fitness level:</label>
                <input
                  type="text"
                  name="fitness_level"
                  value={selectedUser.fitness_level || ''}
                  onChange={handleChange}
                  placeholder="Fitness Level"
                  className="form-control w-75 fitness-level"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Goals:</label>
                <input
                  type="text"
                  name="goals"
                  value={selectedUser.goals || ''}
                  onChange={handleChange}
                  placeholder="Goals"
                  className="form-control w-75"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Health Conditions:</label>
                <input
                  type="text"
                  name="health_conditions"
                  value={selectedUser.health_conditions || ''}
                  onChange={handleChange}
                  placeholder="Health Conditions"
                  className="form-control w-50"
                />
              </div>
              <div className="mb-1 d-flex align-items-center justify-content-between fw-semibold">
                <label htmlFor="name">Photo:</label>

                <img
                  src={photoUrl}
                  alt="User"
                  className="img-thumbnail my-1 me-5"
                  style={{ maxWidth: '50px', height: '50px' }}
                />
                <input
                  type="file"
                  name="photo_url"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-control w-50"
                />
              </div>
              <button
                onClick={handleSaveUser}
                className="btn btn-primary w-100"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">User ID:</span>{' '}
                {selectedUser.user_id}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Name:</span>{' '}
                {selectedUser.name}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Email:</span>{' '}
                {selectedUser.email}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Age:</span>{' '}
                {selectedUser.age}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Weight:</span>{' '}
                {selectedUser.weight}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Gender:</span>{' '}
                {selectedUser.gender}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Fitness Level:</span>{' '}
                {selectedUser.fitness_level}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Goals:</span>{' '}
                {selectedUser.goals}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Health Conditions:</span>{' '}
                {selectedUser.health_conditions}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Created At:</span>{' '}
                {new Date(selectedUser.created_at).toLocaleString()}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Updated At:</span>{' '}
                {new Date(selectedUser.updated_at).toLocaleString()}
              </p>
              <p className="mb-1 d-flex align-items-center justify-align-align-content-between gap-1 mb-2 fw-normal">
                <span className="fw-semibold w-50">Photo:</span>
                <img
                  src={photoUrl}
                  alt="User"
                  className="img-thumbnail"
                  style={{ maxWidth: '50px', height: '50px' }}
                />
              </p>
              <button
                className="btn  btn-primary w-100"
                onClick={() => handleEditUser(selectedUser)}
              >
                Edit
              </button>
            </div>
          )}
        </Modal>
      )}
      {isDeleteConfirmOpen && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={closeDeleteConfirmModal}>
          <h2>Confirm Delete</h2>
          <div className="question">
            <p className="delete-question">
              Are you sure you want to delete:{' '}
              <span>{userToDelete?.name} ?</span>
            </p>
            <div className="answers d-flex justify-content-between mt-3">
              <button
                className="btn w-25 btn-danger"
                onClick={() => handleDeleteUser(userToDelete.user_id)}
              >
                Yes
              </button>
              <button
                className="btn w-25 btn-secondary"
                onClick={closeDeleteConfirmModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Admin
