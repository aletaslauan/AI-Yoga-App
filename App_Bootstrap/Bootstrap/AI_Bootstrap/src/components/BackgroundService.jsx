import { useEffect, useState } from 'react';
import axios from 'axios';

const BackgroundService = ({ userId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);

  // Calculate the workout duration when the timer is running
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000)); // duration in seconds
      }, 1000);
    } else if (!isRunning && duration !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Function to start the workout
  const startWorkout = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  // Function to stop the workout and send the data to the backend
  const stopWorkout = async () => {
    setIsRunning(false);
    try {
      const response = await axios.post(`'http://localhost:3000/api/session`, {
        user_id: userId,
        duration: Math.floor(duration / 60), // duration in minutes
        calories_burned: calculateCalories(duration), // Use a function to calculate calories
      });
      console.log('Workout data sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending workout data:', error);
    }
  };

  // Function to reset the workout timer
  const resetWorkout = () => {
    setIsRunning(false);
    setDuration(0);
    setStartTime(null);
  };

  // Simple function to calculate calories burned based on duration
  const calculateCalories = (duration) => {
    // Replace this with a more accurate formula based on the workout type and user's fitness level
    return Math.floor(duration * 0.1); // Example: 0.1 calories per second
  };

  // Example usage of the BackgroundService - auto start the workout
  useEffect(() => {
    startWorkout(); // Automatically starts the workout when the component mounts

    // Stop the workout after a certain condition (e.g., after 10 minutes)
    const workoutDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const timeoutId = setTimeout(() => {
      stopWorkout();
      resetWorkout();
    }, workoutDuration);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <h2>Background Workout Service</h2>
      <p>Time Elapsed: {Math.floor(duration / 60)} min {duration % 60} sec</p>
      <button onClick={startWorkout} disabled={isRunning}>
        Start
      </button>
      <button onClick={stopWorkout} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={resetWorkout} disabled={isRunning || duration === 0}>
        Reset
      </button>
    </div>
  );
};

export default BackgroundService;
