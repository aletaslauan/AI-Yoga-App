import { useRef } from 'react'
import { BsInfoSquare } from 'react-icons/bs'
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import BurgerMenu from '../components/BurgerMenu'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/activity.scss'

const videoData = [
  {
    title: 'Dance Cardio',
    subtitle: 'Fun dance workout',
    url: 'https://videos.pexels.com/video-files/3327752/3327752-hd_1920_1080_24fps.mp4',
  },
  {
    title: 'Cardio Blast',
    subtitle: 'High-intensity interval training',
    url: 'https://videos.pexels.com/video-files/4110446/4110446-sd_640_360_30fps.mp4',
  },
  {
    title: 'Strength Training',
    subtitle: 'Full body workout',
    url: 'https://videos.pexels.com/video-files/2790143/2790143-sd_640_360_25fps.mp4',
  },
  {
    title: 'Yoga Flow',
    subtitle: 'Relaxing and stretching',
    url: 'https://videos.pexels.com/video-files/8939440/8939440-sd_640_360_25fps.mp4',
  },
  {
    title: 'Pilates Core',
    subtitle: 'Strengthen your core',
    url: 'https://videos.pexels.com/video-files/8981814/8981814-sd_640_360_30fps.mp4',
  },
]

const videoData2 = [
  {
    title: 'Dance Cardio',
    subtitle: 'Fun dance workout',
    url: 'https://videos.pexels.com/video-files/6111024/6111024-sd_640_360_25fps.mp4',
  },
  {
    title: 'Strength Training',
    subtitle: 'Full body workout',
    url: 'https://videos.pexels.com/video-files/4761482/4761482-uhd_2732_1440_25fps.mp4',
  },
  {
    title: 'Yoga Flow',
    subtitle: 'Relaxing and stretching',
    url: 'https://videos.pexels.com/video-files/2376809/2376809-hd_1920_1080_24fps.mp4',
  },
  {
    title: 'Cardio Blast',
    subtitle: 'High-intensity interval training',
    url: 'https://videos.pexels.com/video-files/4260134/4260134-uhd_2560_1440_25fps.mp4',
  },
  {
    title: 'Pilates Core',
    subtitle: 'Strengthen your core',
    url: 'https://videos.pexels.com/video-files/5929367/5929367-uhd_2560_1440_25fps.mp4',
  },
]

const Activity = () => {
  const slideshowRef1 = useRef(null)
  const slideshowRef2 = useRef(null)
  let touchStartX = 0
  let touchEndX = 0

  const nextVideo = (ref) => {
    ref.current.scrollBy({ left: 300, behavior: 'smooth' })
  }

  const prevVideo = (ref) => {
    ref.current.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX = e.touches[0].clientX
  }

  const handleTouchEnd = (ref) => {
    if (touchStartX - touchEndX > 100) {
      nextVideo(ref)
    }
    if (touchStartX - touchEndX < -100) {
      prevVideo(ref)
    }
  }

  return (
    <div className="container-fluid activity-container">
      <BurgerMenu />
      <h3>Activity</h3>
      <div className="info-container w-100 ms-5">
        <div className="d-flex align-items-center justify-content-start my-1 info">
          <BsInfoSquare className="me-2 mb-3" />
          <p>Try something new this week</p>
        </div>
      </div>
      <div className="exercise w-100 d-flex-col align-items-start justify-content-start">
        <h3>Your Exercise for this week</h3>
        <p className="ms-5">&#x2022; Yoga session</p>
      </div>
      <div className="slideshow-container position-relative mb-4">
        <button
          onClick={() => prevVideo(slideshowRef1)}
          className="btn btn-light slideshow-control position-absolute start-0"
        >
          <FiChevronsLeft />
        </button>
        <div
          className="d-flex overflow-hidden cards-container"
          ref={slideshowRef1}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(slideshowRef1)}
        >
          {videoData.map((video, index) => (
            <div
              className="card me-3"
              key={index}
              style={{ minWidth: '300px' }}
            >
              <div className="video-container">
                <video src={video.url} controls className="w-100" />
              </div>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{video.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => nextVideo(slideshowRef1)}
          className="btn btn-light slideshow-control position-absolute end-0"
        >
          <FiChevronsRight />
        </button>
      </div>
      <div className="exercise w-100 d-flex-col align-items-start justify-content-start mb-1">
        <p className="ms-5">&#x2022; Workouts, Pilates, Body Art</p>
      </div>
      <div className="slideshow-container position-relative">
        <button
          onClick={() => prevVideo(slideshowRef2)}
          className="btn btn-light slideshow-control position-absolute start-0"
        >
          <FiChevronsLeft />
        </button>
        <div
          className="d-flex overflow-hidden cards-container"
          ref={slideshowRef2}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(slideshowRef2)}
        >
          {videoData2.map((video, index) => (
            <div
              className="card me-3"
              key={index}
              style={{ minWidth: '300px' }}
            >
              <div className="video-container">
                <video src={video.url} controls className="w-100" />
              </div>
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{video.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => nextVideo(slideshowRef2)}
          className="btn btn-light slideshow-control position-absolute end-0"
        >
          <FiChevronsRight />
        </button>
      </div>
    </div>
  )
}

export default Activity
