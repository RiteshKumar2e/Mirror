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
  const [lightActive, setLightActive] = useState(false);
  const [lastComplimentType, setLastComplimentType] = useState('general');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [location, setLocation] = useState(null);
  const [time, setTime] = useState(new Date());
  const isManualLightRef = useRef(false);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Location not available:', error);
          setLocation(null);
        }
      );
    }

    // Update time every second
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const generalCompliments = React.useMemo(() => [
    "You are absolutely stunning ✨",
    "Your smile lights up the room 💫",
    "You deserve all the happiness 💖",
    "Your energy is contagious 🔥",
    "You're one of a kind 🌟",
    "Your potential is limitless 🚀",
    "You make the world better 💕",
    "Be proud of yourself today 👑",
    "You're glowing with confidence 💎",
    "Your kindness is inspiring 💖",
    "You're a true masterpiece ✨",
    "Believe in yourself always 🌈",
    "You're exactly who you need to be 💫",
    "Your presence matters so much 💕",
    "You've got this, legend 🔥",
    "You're stronger than you think 💪",
    "Your future is brighter than ever ✨",
    "You deserve all good things 🌟",
    "You're beautifully unique 💖",
    "Keep shining like the star you are 💫",
    "Your worth is immeasurable 👑",
    "You inspire everyone around you 🌈",
    "You're living your best life 💎",
    "Absolutely fabulous today 💖",
    "You're meant for greatness ✨",
    "Your smile is everything 😊",
    "Being you is enough 🌟",
    "You're an absolute gem 💕",
    "Keep being your amazing self 🔥",
    "You're a ray of sunshine ☀️",
    "Your dreams are valid 🚀",
    "You're incredible, never forget that 💖",
    "Life is better with you in it 💫",
    "You've earned that confidence 👑",
    "Your spirit is unbreakable 💪",
    "You're blowing it out of the water 🌟",
    "Perfection looks like you ✨",
    "You're a walking inspiration 💖",
    "Your vibe is immaculate 💎",
    "Keep crushing your goals 🔥"
  ], []);

  const specialCompliments = React.useMemo(() => [
    "That's the glow of someone who's got their life together ✨",
    "Your confidence is absolutely magnetic 💫",
    "You're radiating pure elegance right now 👑",
    "That look screams success and style 💖",
    "You're literally glowing from within 💕",
    "Your presentation is absolutely flawless 🌟",
    "You've got that natural beauty energy ✨",
    "That's the face of someone destined for greatness 🚀",
    "Your aura is simply stunning 💎",
    "You're serving major talent and beauty 💫",
    "Your eyes sparkle with possibility 💖",
    "That confidence looks absolutely divine on you ✨",
    "You're an absolute vision right now 🌈",
    "Your style choices are impeccable 👑",
    "You're glowing like you own the world 💕",
    "That's the smile of someone living their best life 🔥",
    "Your presence is pure magic ✨",
    "You're looking like your most authentic self 💖",
    "That's undeniable star power you're giving 💫",
    "Your beauty is timeless and effortless 💎",
    "You're absolutely nailing this look 🌟",
    "Your essence is pure gold ✨",
    "You're glowing with pure joy and light 💕",
    "That confidence is absolutely contagious 🔥",
    "You're a vision of grace and beauty 👑",
    "Your inner light shines so bright ✨",
    "You're looking like the best version of yourself 💖",
    "That's the energy of a true winner 🚀",
    "Your beauty runs so deep, it shows 💫",
    "You're absolutely captivating 💎"
  ], []);

  const filters = React.useMemo(() => ({
    // BASIC & CLASSIC (8)
    none: { name: 'Normal', css: 'none' },
    bright: { name: '☀️ Bright', css: 'brightness(1.3)' },
    dark: { name: '🌙 Dark', css: 'brightness(0.8)' },
    grayscale: { name: '⚫ B&W', css: 'grayscale(100%)' },
    sepia: { name: '🌾 Sepia', css: 'sepia(100%)' },
    invert: { name: '🔄 Invert', css: 'invert(1)' },
    warm: { name: '🔥 Warm', css: 'hue-rotate(15deg) saturate(1.2)' },
    cool: { name: '❄️ Cool', css: 'hue-rotate(180deg) saturate(0.8)' },

    // SNAPCHAT STYLE (15)
    snapchillax: { name: '😎 Chill', css: 'hue-rotate(200deg) saturate(1.3) brightness(1.1)' },
    snapglow: { name: '✨ Glow', css: 'brightness(1.25) saturate(1.4)' },
    snapneon: { name: '🌟 Neon', css: 'saturate(2) contrast(1.5) brightness(1.15)' },
    snapretro: { name: '🎬 Retro', css: 'sepia(70%) hue-rotate(-10deg) saturate(1.3)' },
    snappurple: { name: '💜 Purple', css: 'hue-rotate(270deg) saturate(1.4) brightness(1.05)' },
    snaplove: { name: '💕 Love', css: 'hue-rotate(350deg) saturate(1.6) brightness(1.1)' },
    snapparty: { name: '🎉 Party', css: 'hue-rotate(45deg) saturate(1.8) contrast(1.3)' },
    snappastel: { name: '🎨 Pastel', css: 'saturate(0.7) brightness(1.2) contrast(0.9)' },
    snapmirror: { name: '🪞 Mirror', css: 'hue-rotate(180deg) saturate(1.2)' },
    snapblur: { name: '🌫️ Dream', css: 'blur(1.5px) brightness(1.1) saturate(1.2)' },
    snapfrosted: { name: '❄️ Frosted', css: 'brightness(1.2) saturate(0.9) contrast(1.2)' },
    snapmagic: { name: '✨ Magic', css: 'saturate(1.6) brightness(1.15) contrast(1.2)' },
    snapmoonlight: { name: '🌙 Moonlight', css: 'brightness(0.85) saturate(0.8) hue-rotate(210deg)' },
    snapsunset: { name: '🌅 Golden', css: 'hue-rotate(25deg) saturate(1.5) brightness(1.15)' },
    snapocean: { name: '🌊 Ocean', css: 'hue-rotate(190deg) saturate(1.4) brightness(1.05)' },

    // PROFESSIONAL (12)
    studio: { name: '📷 Studio', css: 'contrast(1.3) brightness(1.05) saturate(1.1)' },
    cinema: { name: '🎬 Cinema', css: 'grayscale(100%) brightness(0.9) contrast(1.1)' },
    softfocus: { name: '💫 Soft', css: 'blur(0.8px) brightness(1.05) saturate(1.1)' },
    clarity: { name: '🔍 Clarity', css: 'contrast(1.4) saturate(1.2) brightness(1.05)' },
    dramatic: { name: '🎭 Dramatic', css: 'contrast(1.6) saturate(0.9) brightness(0.95)' },
    elegant: { name: '✨ Elegant', css: 'brightness(1.1) saturate(0.9) contrast(1.1)' },
    bold: { name: '⚡ Bold', css: 'contrast(1.5) saturate(1.3)' },
    fade: { name: '💭 Faded', css: 'brightness(1.1) saturate(0.7) opacity(0.95)' },
    prestige: { name: '👑 Prestige', css: 'grayscale(100%) contrast(1.2) brightness(1.1)' },
    vivid: { name: '🎨 Vivid', css: 'saturate(2) brightness(1.05)' },
    muted: { name: '🎭 Muted', css: 'saturate(0.5) brightness(0.95)' },
    vintage: { name: '📸 Vintage', css: 'sepia(50%) saturate(1.2) brightness(0.9)' },

    // MOOD & EMOTION (10)
    romantic: { name: '💗 Romantic', css: 'hue-rotate(330deg) saturate(1.3) brightness(1.1)' },
    energetic: { name: '⚡ Energetic', css: 'hue-rotate(45deg) saturate(1.7) brightness(1.2) contrast(1.2)' },
    calm: { name: '🧘 Calm', css: 'saturate(0.8) brightness(1.05)' },
    happy: { name: '😊 Happy', css: 'hue-rotate(45deg) saturate(1.4) brightness(1.15)' },
    moody: { name: '🎭 Moody', css: 'hue-rotate(240deg) brightness(0.9) saturate(1.2) contrast(1.1)' },
    mysterious: { name: '🔮 Mysterious', css: 'hue-rotate(260deg) brightness(0.85) contrast(1.1)' },
    dreamy: { name: '💭 Dreamy', css: 'hue-rotate(280deg) saturate(1.2) brightness(1.05) blur(0.5px)' },
    peaceful: { name: '☮️ Peaceful', css: 'hue-rotate(120deg) saturate(0.9) brightness(1.1)' },
    artistic: { name: '🎨 Artistic', css: 'contrast(1.4) saturate(1.5)' },
    vintage_mood: { name: '🎞️ Nostalgia', css: 'sepia(80%) saturate(0.8) brightness(0.95)' },

    // EXTREME & FUN (12)
    acidtrip: { name: '🌈 Acid', css: 'hue-rotate(45deg) saturate(3) contrast(1.8)' },
    rainbow: { name: '🎨 Rainbow', css: 'hue-rotate(360deg) saturate(2.5)' },
    thermalvision: { name: '🔥 Thermal', css: 'hue-rotate(0deg) saturate(1) brightness(1.3) contrast(1.5)' },
    xray: { name: '💀 X-Ray', css: 'invert(1) brightness(1.2)' },
    matrix: { name: '💚 Matrix', css: 'hue-rotate(120deg) saturate(2) brightness(0.9)' },
    cyberpunk: { name: '🤖 Cyber', css: 'hue-rotate(280deg) saturate(2) brightness(1.2) contrast(1.4)' },
    scifi: { name: '👽 Sci-Fi', css: 'grayscale(100%) brightness(1.3) contrast(1.6)' },
    disco: { name: '🪩 Disco', css: 'hue-rotate(50deg) saturate(2) brightness(1.2) contrast(1.3)' },
    hazeeffect: { name: '🌫️ Haze', css: 'brightness(1.15) saturate(1.8) blur(1px)' },
    hazewarmth: { name: '☀️ Haze+', css: 'hue-rotate(20deg) brightness(1.2) saturate(1.6)' },
    glitchy: { name: '📺 Glitch', css: 'contrast(1.7) saturate(0.6) brightness(0.95)' },
    surreal: { name: '🌀 Surreal', css: 'hue-rotate(180deg) saturate(1.8) brightness(0.9) contrast(1.2)' },

    // NATURE & OUTDOOR (8)
    forest: { name: '🌲 Forest', css: 'hue-rotate(100deg) saturate(1.3) brightness(1.05)' },
    sunset: { name: '🌅 Sunset', css: 'hue-rotate(30deg) saturate(1.5) brightness(1.15)' },
    ocean: { name: '🌊 Ocean', css: 'hue-rotate(185deg) saturate(1.4) brightness(1.1)' },
    sky: { name: '☁️ Sky', css: 'hue-rotate(200deg) saturate(1.2) brightness(1.2)' },
    nature: { name: '🍃 Nature', css: 'hue-rotate(90deg) saturate(1.2) brightness(1.05)' },
    desert: { name: '🏜️ Desert', css: 'hue-rotate(35deg) saturate(1.4) brightness(1.25)' },
    snow: { name: '❄️ Snow', css: 'brightness(1.35) saturate(0.7) contrast(0.9)' },
    autumn: { name: '🍂 Autumn', css: 'hue-rotate(20deg) saturate(1.6) brightness(1.1)' },

    // SPECIAL EFFECTS (10)
    bloom: { name: '💐 Bloom', css: 'saturate(1.5) brightness(1.2) blur(0.3px)' },
    lighten: { name: '✨ Lighten', css: 'brightness(1.4) saturate(0.9)' },
    darken: { name: '🌑 Darken', css: 'brightness(0.7) contrast(1.2)' },
    ultraviolet: { name: '💜 UV', css: 'hue-rotate(260deg) saturate(1.8) brightness(1.15)' },
    infrared: { name: '🔴 IR', css: 'hue-rotate(350deg) saturate(1.6) brightness(1.1)' },
    shadow: { name: '🌑 Shadow', css: 'brightness(0.75) contrast(1.3)' },
    spotlight: { name: '💡 Spotlight', css: 'brightness(1.3) contrast(1.4)' },
    twilight: { name: '🌆 Twilight', css: 'hue-rotate(250deg) brightness(0.9) saturate(1.2)' },
    auroras: { name: '🌌 Aurora', css: 'hue-rotate(200deg) saturate(1.8) brightness(1.15)' },
    eclipse: { name: '🌑 Eclipse', css: 'brightness(0.6) contrast(1.4) saturate(1.3)' },
  }), []);

  const applyFilterToCanvas = (canvas, ctx, filterKey) => {
    if (filterKey === 'none' || !filterKey) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filterKey) {
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;
      case 'brightness':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        break;
      default:
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  };

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

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 500;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply selected filter
    applyFilterToCanvas(canvas, ctx, selectedFilter);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);

    // Save photo with timestamp and metadata
    const photo = {
      photoId: `${userId}-${Date.now()}`,
      userId,
      timestamp: Date.now(),
      photoTime: time.toLocaleString(),
      location: location ? { lat: location.lat, lng: location.lng } : null,
      imageData: photoData,
      filter: selectedFilter
    };

    // Store in localStorage with photos prefix
    localStorage.setItem(`photo-${photo.photoId}`, JSON.stringify(photo));

    // Add to user's photo gallery
    const photoGallery = JSON.parse(localStorage.getItem(`gallery-${userId}`) || '[]');
    photoGallery.push(photo.photoId);
    localStorage.setItem(`gallery-${userId}`, JSON.stringify(photoGallery));

    // Download to user's device
    const link = document.createElement('a');
    link.href = photoData;
    link.download = `mirror-photo-${Date.now()}.jpg`;
    link.click();

    alert('✨ Photo saved and downloaded!');
  }, [userId, selectedFilter, location, time]);

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
              className={`video-feed filter-${selectedFilter}`}
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
                className={`control-btn filter-btn ${showFilterPanel ? 'active' : ''}`}
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                😊
              </button>
              <button
                className="control-btn photo-btn"
                onClick={capturePhoto}
              >
                📸
              </button>
              <button
                className="control-btn close-btn"
                onClick={stopMirror}
              >
                ✖
              </button>
            </div>

            {showFilterPanel && (
              <div className="filter-panel">
                <h4>Filters</h4>
                <div className="filter-grid">
                  {Object.entries(filters).map(([key, filter]) => (
                    <button
                      key={key}
                      className={`filter-option ${selectedFilter === key ? 'selected' : ''}`}
                      onClick={() => setSelectedFilter(key)}
                      title={filter.name}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default UserPage;
