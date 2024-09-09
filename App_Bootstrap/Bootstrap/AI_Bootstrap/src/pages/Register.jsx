import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AiOutlineUserAdd } from 'react-icons/ai'
import axios from 'axios'
import Popup from '../components/Popup'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/register.scss'

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    fitness_level: '',
    goals: '',
    health_conditions: '',
    photo_url: '',
    weight: '',
  })
  const [popup, setPopup] = useState({ show: false, title: '', message: '' })
  const [photoUrl, setPhotoUrl] = useState('')
  const [oldPhotoPath, setOldPhotoPath] = useState('')
  const navigate = useNavigate()
  const nameInputRef = useRef(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [step])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo_url' && files[0]) {
      const formData = new FormData()
      formData.append('photo', files[0])
      formData.append('oldFilePath', oldPhotoPath)

      axios
        .post('http://localhost:3000/api/upload', formData)
        .then((response) => {
          setOldPhotoPath(response.data.filePath)
          setFormData((prevData) => ({
            ...prevData,
            photo_url: response.data.filePath,
          }))
          setPhotoUrl(`${response.data.filePath}?${new Date().getTime()}`)
        })
        .catch((error) => {
          console.error('Error uploading photo', error)
          alert('Error uploading photo')
        })
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }))
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1 && formData.password !== formData.confirmPassword) {
      setPopup({
        show: true,
        title: 'Error',
        message: 'Passwords do not match',
      })
      return
    }
    setStep(step + 1)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/api/auth/register', formData)
      setPopup({ show: true, title: 'Registration successful', message: '' })
    } catch (error) {
      console.error('Registration failed', error)
      setPopup({
        show: true,
        title: 'Registration failed',
        message: 'User already registered' || 'Unknown error',
      })
    }
  }

  const closePopup = () => {
    setPopup({ show: false, title: '', message: '' })
    if (popup.title === 'Registration successful') {
      navigate('/login')
    }
  }
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="container register-container d-flex justify-content-center align-items-center">
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
        />
      )}
      <form
        onSubmit={step === 3 ? handleRegister : handleNext}
        className="register-form p-4 rounded shadow"
      >
        <div className="icon-container mb-4 d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={handleBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>
            {step === 1
              ? 'Register'
              : step === 2
              ? 'Additional Info'
              : 'Fitness Info'}
          </h2>
          <AiOutlineUserAdd className="user-icon" />
        </div>

        {step === 1 && (
          <>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="form-control"
                ref={nameInputRef}
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="form-control"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p>* is required</p>
            <div className="mb-3">
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age *"
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-3">
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg) *"
                required
                className="form-control"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-3">
              <input
                type="text"
                name="fitness_level"
                value={formData.fitness_level}
                onChange={handleChange}
                placeholder="Fitness Level (Optional)"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                placeholder="Goals (Optional)"
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <textarea
                name="health_conditions"
                value={formData.health_conditions}
                onChange={handleChange}
                placeholder="Health Conditions (Optional)"
                className="form-control"
              />
            </div>
            {/* <div className="mb-3">
              <label htmlFor="photo-upload" className="photo-upload-label">
                Choose Photo (Optional)
              </label>
              <input
                type="file"
                name="photo_url"
                accept="image/*"
                onChange={handleChange}
                className="form-control"
              />
            </div> */}
          </>
        )}

        <button className="btn btn-primary w-100" type="submit">
          {step === 3 ? 'Register' : 'Next'}
        </button>
      </form>
    </div>
  )
}

export default Register