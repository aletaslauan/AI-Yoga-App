import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import poseImage from '../assets/images/yoga_pose_10_1.jpg';

const PoseExtractor = () => {
  const [detector, setDetector] = useState(null);
  const [referencePose, setReferencePose] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getImageDimensions = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = imageUrl;
    });
  };
  
  // Usage example:
  const imageUrl = poseImage;
  getImageDimensions(imageUrl).then(({ width, height }) => {
    console.log(`Image width: ${width}, height: ${height}`);
  });

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      setError(null);
      try {
        await tf.ready(); // Ensure TensorFlow.js is ready
        await tf.setBackend('webgl'); // Ensure the backend is set

        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        });
        setDetector(detector);
        console.log('MoveNet model loaded successfully');
      } catch (error) {
        setError('Error loading MoveNet model');
        console.error('Error loading MoveNet model:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  const saveAsJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadImageAndExtractKeypoints = async (imageUrl) => {
    if (!detector) {
      console.log('Model is not yet loaded. Please wait...');
      return;
    }

    try {
      const img = new Image();
      img.src = imageUrl;
      await img.decode();

      const poses = await detector.estimatePoses(img, {
        flipHorizontal: false,
      });

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        console.log('Extracted Keypoints:', keypoints);
        setReferencePose(keypoints);
        saveAsJSON(keypoints, 'reference_pose.json');
      } else {
        console.log('No pose detected.');
      }
    } catch (error) {
      console.error('Error extracting keypoints:', error);
    }
  };

  return (
    <div>
      <h2>Pose Extractor</h2>
      {loading && <p>Loading model...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={() => loadImageAndExtractKeypoints(poseImage)}
        disabled={loading || !detector}
      >
        {loading ? 'Please wait...' : 'Extract Pose from Image'}
      </button>
      {referencePose && (
        <div>
          <h3>Reference Pose Keypoints:</h3>
          <pre>{JSON.stringify(referencePose, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PoseExtractor;
