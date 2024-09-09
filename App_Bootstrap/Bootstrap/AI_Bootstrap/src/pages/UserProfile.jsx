import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserContext } from '../context/UserContext'
import BurgerMenu from '../components/BurgerMenu'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/userprofile.scss'

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    fitness_level: '',
    goals: '',
    health_conditions: '',
    photo_url: '',
    created_at: '',
    weight: '',
  })
  const [oldPhotoPath, setOldPhotoPath] = useState('')
  const [photoUrl, setPhotoUrl] = useState(userData.photo_url)

  useEffect(() => {
    if (user) {
      setUserData(user)
      setOldPhotoPath(user.photo_url) // Save old photo path
      setPhotoUrl(user.photo_url)
    }
  }, [user])

  const handleChange = async (event) => {
    const { name, value, files } = event.target
    if (name === 'photo_url' && files[0]) {
      const formData = new FormData()
      formData.append('photo', files[0])
      formData.append('oldFilePath', oldPhotoPath)

      try {
        const response = await axios.post(
          'http://localhost:3000/api/upload',
          formData
        )
        setOldPhotoPath(response.data.filePath) // Update response.data.filePath
        setUserData((prevData) => ({
          ...prevData,
          photo_url: response.data.filePath,
        }))
        // Update photoUrl state with a unique query string to force reload
        setPhotoUrl(`${response.data.filePath}?${new Date().getTime()}`)
      } catch (error) {
        console.error('Error uploading photo', error)
        alert('Error uploading photo')
      }
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleSave = async () => {
    const token =
      localStorage.getItem('user_token') || localStorage.getItem('admin_token')
    if (!token) {
      console.error('No token found, please log in')
      return
    }

    try {
      const response = await axios.put(
        'http://localhost:3000/api/auth/profile',
        {
          name: userData.name,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          fitness_level: userData.fitness_level,
          goals: userData.goals,
          health_conditions: userData.health_conditions,
          photo_url: userData.photo_url,
          weight: userData.weight,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data) {
        setUser(response.data)
        setIsEditing(false)
        window.location.reload() // Refresh the window after saving
      }
    } catch (error) {
      console.error('Error updating user data', error)
      alert('Error updating user data')
    }
  }

  const navigate = useNavigate()

  return (
    <div className="container-fluid user-profile-container">
      <BurgerMenu />
      <div className="profile-title">
        <h3>User Profile</h3>
        <button
          type="button"
          className="btn close-profile btn-link"
          onClick={() => navigate(-1)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="user-profile-form">
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              {/* <label>Photo:</label> */}
              {isEditing ? (
                <>
                  <img src={`http://localhost:3000${photoUrl}`} alt="User" />
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    Choose Photo
                  </label>
                  <input
                    type="file"
                    name="photo_url"
                    accept="image/*"
                    onChange={(event) => handleChange(event)}
                  />
                </>
              ) : (
                <img src={`http://localhost:3000${photoUrl}`} alt="User" />
              )}
              </div>
              <div className="form-group">
                <label>Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={userData.name || ''}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <p>{userData.name}</p>
              )}
            </div>
            <div className="form-group">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{userData.email}</p>
              )}
            </div>
            <div className="form-group">
              <label>Age:</label>
              {isEditing ? (
                <select
                  name="age"
                  value={userData.age || ''}
                  onChange={handleChange}
                  className="form-control"
                >
                  {[...Array(100).keys()].map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              ) : (
                <p>{userData.age}</p>
              )}
            </div>
          </div>
          <div className="col-md-6">
          <div className="form-group">
              <label>Weight:</label>
              {isEditing ? (
                <input
                  name="weight"
                  type="text"
                  value={userData.weight || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{userData.weight}</p>
              )}
            </div>
            <div className="form-group">
              <label>Gender:</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={userData.gender || ''}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p>{userData.gender}</p>
              )}
            </div>
            <div className="form-group">
              <label>Fitness Level:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fitness_level"
                  value={userData.fitness_level || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{userData.fitness_level}</p>
              )}
            </div>
            <div className="form-group">
              <label>Goals:</label>
              {isEditing ? (
                <textarea
                  name="goals"
                  value={userData.goals || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{userData.goals}</p>
              )}
            </div>
            <div className="form-group">
              <label>Health Conditions:</label>
              {isEditing ? (
                <textarea
                  name="health_conditions"
                  value={userData.health_conditions || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{userData.health_conditions}</p>
              )}
            </div>
          </div>
        </div>
        <div className="form-group">
          {isEditing ? (
            <button className="btn btn-primary w-25" onClick={handleSave}>
              Save
            </button>
          ) : (
            <button
              className="btn btn-primary w-25"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
