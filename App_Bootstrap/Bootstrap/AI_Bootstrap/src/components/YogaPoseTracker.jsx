import React, { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '../styles/yogaposetracker.scss'
const referencePose =[
  {
    "y": 166.90832376480103,
    "x": 154.20538187026978,
    "score": 0.7589737176895142,
    "name": "nose"
  },
  {
    "y": 162.18908429145813,
    "x": 158.59381556510925,
    "score": 0.8424611687660217,
    "name": "left_eye"
  },
  {
    "y": 163.074991106987,
    "x": 147.5545048713684,
    "score": 0.907947838306427,
    "name": "right_eye"
  },
  {
    "y": 165.7861590385437,
    "x": 165.06178379058838,
    "score": 0.8518884778022766,
    "name": "left_ear"
  },
  {
    "y": 168.17933320999146,
    "x": 141.20862185955048,
    "score": 0.7710200548171997,
    "name": "right_ear"
  },
  {
    "y": 190.55636823177335,
    "x": 178.09710502624512,
    "score": 0.7933392524719238,
    "name": "left_shoulder"
  },
  {
    "y": 192.5217121839523,
    "x": 129.61418330669403,
    "score": 0.8949770331382751,
    "name": "right_shoulder"
  },
  {
    "y": 148.13042432069778,
    "x": 191.77300930023193,
    "score": 0.9026310443878174,
    "name": "left_elbow"
  },
  {
    "y": 155.27397394180298,
    "x": 111.12061142921448,
    "score": 0.8690294027328491,
    "name": "right_elbow"
  },
  {
    "y": 125.52210688591002,
    "x": 155.30886054039001,
    "score": 0.7157078385353088,
    "name": "left_wrist"
  },
  {
    "y": 126.55618786811827,
    "x": 141.9141411781311,
    "score": 0.8193197250366211,
    "name": "right_wrist"
  },
  {
    "y": 262.8631889820099,
    "x": 175.76229572296143,
    "score": 0.7991237640380859,
    "name": "left_hip"
  },
  {
    "y": 263.5684132575989,
    "x": 145.06181180477142,
    "score": 0.7919983267784119,
    "name": "right_hip"
  },
  {
    "y": 332.3002874851227,
    "x": 190.79530835151672,
    "score": 0.8211387991905212,
    "name": "left_knee"
  },
  {
    "y": 330.7761132717132,
    "x": 129.35613691806793,
    "score": 0.846349835395813,
    "name": "right_knee"
  },
  {
    "y": 372.289502620697,
    "x": 199.7569978237152,
    "score": 0.5451735854148865,
    "name": "left_ankle"
  },
  {
    "y": 371.526038646698,
    "x": 110.78177690505981,
    "score": 0.5791597366333008,
    "name": "right_ankle"
  }
]
const YogaPoseTracker = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [detector, setDetector] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [accuracy, setAccuracy] = useState(0)
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true)
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend('webgl')
        await tf.ready()
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          }
        )
        setDetector(detector)
      } catch (error) {
        console.error('Error loading model:', error)
      }
    }
    loadModel()
  }, [])
  useEffect(() => {
    const startVideo = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 300, height: 450 },
          })
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            detectPose()
          }
        } catch (error) {
          console.error('Error accessing the camera:', error)
          alert(
            'Could not start video source. Please check your camera permissions or try a lower resolution.'
          )
        }
      }
    }
    startVideo()
  }, [detector])
  const detectPose = async () => {
    if (detector && videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const detect = async () => {
        const poses = await detector.estimatePoses(video, {
          flipHorizontal: false,
        })
        if (poses.length > 0) {
          poses.forEach((pose) => {
            // Iterate over each pose
            const liveKeypoints = pose.keypoints
            const { feedbackMessage, accuracyScore } = compareWithReferencePose(
              liveKeypoints,
              referencePose
            )
            setFeedback(feedbackMessage)
            setAccuracy(accuracyScore)
            provideAudioFeedback(feedbackMessage)

            // Draw results for each pose with its specific accuracy
            drawResults(pose, accuracyScore)
          })
        }
        requestAnimationFrame(detect)
      }
      detect()
    }
  }
  const drawResults = (pose, accuracy) => {
    // Add accuracy as a parameter
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (pose.keypoints) {
      const adjustedKeypoints = adjustKeypoints(pose.keypoints, canvas.width)
      drawSkeleton(adjustedKeypoints, ctx, accuracy)
      drawKeypoints(adjustedKeypoints, ctx, accuracy)
    }
  }
  const adjustKeypoints = (keypoints, canvasWidth) => {
    return keypoints.map((keypoint) => ({
      ...keypoint,
      x: canvasWidth - keypoint.x,
    }))
  }
  const drawKeypoints = (keypoints, ctx, accuracy) => {
    keypoints.forEach((keypoint) => {
      const { y, x, score } = keypoint
      if (score > 0.6) {
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI)
        // Modificăm condiția pentru accuracy > 85
        ctx.fillStyle =
          accuracy > 85 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)'
        ctx.shadowColor =
          accuracy > 85 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'
        ctx.shadowBlur = accuracy > 85 ? 20 : 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const drawSkeleton = (keypoints, ctx, accuracy) => {
    const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.MoveNet
    )
    // accuracy > 85
    ctx.strokeStyle =
      accuracy > 85 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)'
    ctx.lineWidth = accuracy > 85 ? 8 : 6
    adjacentKeyPoints.forEach(([i, j]) => {
      const kp1 = keypoints[i]
      const kp2 = keypoints[j]
      if (kp1.score > 0.6 && kp2.score > 0.6) {
        ctx.beginPath()
        ctx.moveTo(kp1.x, kp1.y)
        ctx.lineTo(kp2.x, kp2.y)
        ctx.stroke()
      }
    })
  }


  const compareWithReferencePose = (liveKeypoints, referenceKeypoints) => {
    let totalDistance = 0
    let feedback = 'Great job! Keep holding the pose.'
    let isPoseCorrect = true
    const relaxedTolerance = 30
    const partsToAdjust = []

    // Listă cu părțile corpului excluse din feedback
    const excludedParts = [
      'nose',
      'left_eye',
      'right_eye',
      'left_ear',
      'right_ear',
    ]

    liveKeypoints.forEach((liveKeypoint, index) => {
      const referenceKeypoint = referenceKeypoints[index]
      const distance = Math.sqrt(
        Math.pow(liveKeypoint.x - referenceKeypoint.x, 2) +
          Math.pow(liveKeypoint.y - referenceKeypoint.y, 2)
      )
      totalDistance += distance

      if (
        distance > relaxedTolerance &&
        !excludedParts.includes(liveKeypoint.name)
      ) {
        // Excludem părțile din listă
        partsToAdjust.push({
          name: liveKeypoint.name,
          suggestion: getCorrectionSuggestion(
            liveKeypoint.name,
            liveKeypoint,
            referenceKeypoint
          ),
        })
        isPoseCorrect = false
      }
    })

    if (!isPoseCorrect) {
      feedback = 'Adjust your: '
      feedback += partsToAdjust
        .map((part) => `${part.name} (${part.suggestion})`)
        .join(', ')
    }

    const maxDistance = 300
    const accuracyScore = Math.max(
      0,
      100 - (totalDistance / (referenceKeypoints.length * maxDistance)) * 100
    )
    return {
      feedbackMessage: isPoseCorrect ? 'Perfect Pose!' : feedback,
      accuracyScore: accuracyScore.toFixed(2),
    }
  }

  // Function to provide correction suggestions based on the body part and its position
  const getCorrectionSuggestion = (
    partName,
    liveKeypoint,
    referenceKeypoint
  ) => {
    const xDiff = liveKeypoint.x - referenceKeypoint.x
    const yDiff = liveKeypoint.y - referenceKeypoint.y

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      // Primarily a horizontal adjustment
      if (xDiff > 0) {
        return 'move it to the left'
      } else {
        return 'move it to the right'
      }
    } else {
      // Primarily a vertical adjustment
      if (yDiff > 0) {
        return 'move it up'
      } else {
        return 'move it down'
      }
    }
  }

  // audio feedback
  const provideAudioFeedback = (feedbackMessage) => {
    if (audioFeedbackEnabled) {
      if (feedbackMessage !== 'Perfect Pose!') {
        const msg = new SpeechSynthesisUtterance(feedbackMessage)
        msg.lang = 'en-US'
        window.speechSynthesis.speak(msg)
      }
    }
  }

  const toggleAudioFeedback = () => {
    setAudioFeedbackEnabled(!audioFeedbackEnabled)
  }
  return (
    <div
      className="yoga-pose-tracker-container"
      style={{
        // marginTop: '55px',
        // backgroundColor: '#fff',
        display: 'flex',
        gap: '5px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        position: 'relative',
      }}
    >
      <div className="video-info d-flex flex-column align-items-center gap-1">
        <video
          ref={videoRef}
          style={{
            width: '300px',
            height: '450px',
            transform: 'scaleX(-1)',
            borderRadius: '10px',
          }}
          autoPlay
          muted
        />
        <div
          style={{
            // position: 'absolute',
            // top: 0,
            // left: 0,
            backgroundColor:
              accuracy > 80 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
            color: 'white',
            padding: '10px 10px',
            borderRadius: '10px',
            fontSize: '60px',
            width: '300px',
            fontWeight: 'bold',
            marginBottom: '5px',
          }}
        >
          Accuracy: {accuracy}%
        </div>
      </div>
      <canvas className="canvas" ref={canvasRef} />
      <div className="feedback">
        <div
          style={{
            // position: 'absolute',
            // bottom: 0,
            // left: 0,
            backgroundColor:
              feedback === 'Perfect Pose!'
                ? 'rgba(0, 255, 0, 0.3)'
                : 'rgba(255, 0, 0, 0.3)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '30px',
            fontWeight: 'bold',
            height: '650px',
            overflowY: 'auto',
          }}
        >
          {feedback}
        </div>
      </div>
    </div>
  )
}
export default YogaPoseTracker