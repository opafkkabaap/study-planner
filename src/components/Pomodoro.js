// src/components/Pomodoro.jsx
import { useState, useEffect, useRef } from 'react';
import './Pomodoro.css';

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(25);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Presets in minutes
  const presets = [25, 45, 75, 105]; // 25min, 45min, 1:15, 1:45

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress (0 to 1)
  const progress = (selectedPreset * 60 - timeLeft) / (selectedPreset * 60);

  // Circle circumference for stroke-dashoffset
  const circumference = 2 * Math.PI * 90; // r = 90 in SVG

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          // Play beep sound when finished
          if (audioRef.current) audioRef.current.play();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(true);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedPreset * 60);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedPreset * 60);
  };

  const selectPreset = (minutes) => {
    setSelectedPreset(minutes);
    setTimeLeft(minutes * 60);
    stopTimer(); // reset when changing preset
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Create simple beep sound using Web Audio API
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = new Audio();
    // Simple beep using oscillator (fallback if no audio file)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
    // Note: This is just a placeholder — in real app you can use a real .mp3
  }, []);

  return (
    <div className="pomodoro-wrapper">
      <h1>Pomodoro Timer</h1>

      <div className="preset-buttons">
        {presets.map((min) => (
          <button
            key={min}
            className={`preset-btn ${selectedPreset === min ? 'active' : ''}`}
            onClick={() => selectPreset(min)}
          >
            {min >= 60 ? `${Math.floor(min / 60)}:${(min % 60).toString().padStart(2, '0')}` : `${min} min`}
          </button>
        ))}
      </div>

      <div className="timer-container">
        <div className="circle-timer">
          <svg viewBox="0 0 200 200" className="progress-ring">
            <circle
              className="progress-ring__circle-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="progress-ring__circle"
              cx="100"
              cy="100"
              r="90"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className="timer-display">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="controls">
          {!isRunning && !isPaused && (
            <button className="control-btn start" onClick={startTimer}>
              Start
            </button>
          )}
          {isRunning && (
            <button className="control-btn pause" onClick={pauseTimer}>
              Pause
            </button>
          )}
          {isPaused && (
            <button className="control-btn resume" onClick={startTimer}>
              Resume
            </button>
          )}
          <button className="control-btn stop" onClick={stopTimer}>
            Stop
          </button>
          <button className="control-btn reset" onClick={resetTimer}>
            Reset
          </button>
        </div>

        <div className="animation-box">
          <div className="animation-placeholder">Animation Area</div>
          {/* You can replace this with real animation (CSS / Lottie / canvas) */}
        </div>
      </div>

      {timeLeft === 0 && !isRunning && (
        <p className="finished-message">Time's up! Take a break 🎉</p>
      )}
    </div>
  );
}