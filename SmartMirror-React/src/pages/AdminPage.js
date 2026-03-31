import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [userFeeds, setUserFeeds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshRate, setRefreshRate] = useState(1);
  const [statsUpdateTime, setStatsUpdateTime] = useState(new Date());
  const [userPhotos, setUserPhotos] = useState({});
  const [showPhotos, setShowPhotos] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Poll for user feeds from localStorage
  useEffect(() => {
    const pollInterval = setInterval(() => {
      try {
        const feeds = Object.keys(localStorage)
          .filter(key => key.startsWith('feed-'))
          .map(key => {
            try {
              return JSON.parse(localStorage.getItem(key));
            } catch {
              return null;
            }
          })
          .filter(feed => feed && feed.isActive);

        setUserFeeds(feeds);
        setStatsUpdateTime(new Date());
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, refreshRate * 500); // Poll for feeds every 500ms (faster updates)

    return () => clearInterval(pollInterval);
  }, [refreshRate]);

  // Poll for photos at slower rate (every 3 seconds)
  useEffect(() => {
    const photoInterval = setInterval(() => {
      try {
        const photos = {};
        Object.keys(localStorage)
          .filter(key => key.startsWith('gallery-'))
          .forEach(key => {
            const userId = key.replace('gallery-', '');
            const photoIds = JSON.parse(localStorage.getItem(key) || '[]');
            photos[userId] = photoIds
              .map(photoId => {
                try {
                  return JSON.parse(localStorage.getItem(`photo-${photoId}`));
                } catch {
                  return null;
                }
              })
              .filter(photo => photo !== null)
              .sort((a, b) => b.timestamp - a.timestamp);
          });
        
        setUserPhotos(photos);
      } catch (e) {
        console.error('Photo polling error:', e);
      }
    }, 3000); // Poll photos every 3 seconds to reduce lag

    return () => clearInterval(photoInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  const getTotalUsers = () => {
    return userFeeds.length;
  };

  const getActiveUsers = () => {
    return userFeeds.filter(f => f.isActive).length;
  };

  const getTotalPhotos = () => {
    return Object.values(userPhotos).reduce((sum, photos) => sum + photos.length, 0);
  };

  const deletePhoto = (photoId, userId) => {
    if (window.confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      // Remove from localStorage
      localStorage.removeItem(`photo-${photoId}`);

      // Remove from gallery
      const photoGallery = JSON.parse(localStorage.getItem(`gallery-${userId}`) || '[]');
      const updatedGallery = photoGallery.filter(id => id !== photoId);
      localStorage.setItem(`gallery-${userId}`, JSON.stringify(updatedGallery));

      // Close detail modal
      setSelectedPhoto(null);

      // Refresh will happen automatically on next poll
      alert('✅ Photo deleted successfully!');
    }
  };

  const deleteFeed = (userId) => {
    if (window.confirm(`Delete feed for ${userId}? This will remove the live feed.`)) {
      localStorage.removeItem(`feed-${userId}`);
      setSelectedUser(null);
      alert('✅ Feed deleted successfully!');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>👨‍💼 Admin Dashboard</h1>
          <p>Live Mirror Feed Monitor</p>
        </div>

        <div className="admin-controls">
          <div className="control-buttons">
            <button 
              className={`tab-btn ${!showPhotos ? 'active' : ''}`}
              onClick={() => setShowPhotos(false)}
            >
              📹 Live Feeds ({userFeeds.length})
            </button>
            <button 
              className={`tab-btn ${showPhotos ? 'active' : ''}`}
              onClick={() => setShowPhotos(true)}
            >
              📸 Photos ({getTotalPhotos()})
            </button>
          </div>
          <div className="refresh-control">
            <label>Refresh Rate:</label>
            <select value={refreshRate} onChange={(e) => setRefreshRate(Number(e.target.value))}>
              <option value={0.5}>0.5s</option>
              <option value={1}>1s</option>
              <option value={2}>2s</option>
              <option value={5}>5s</option>
            </select>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Active Users</span>
          <span className="stat-value">{getActiveUsers()} / {getTotalUsers()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">{formatTime(statsUpdateTime)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Feeds Connected</span>
          <span className="stat-value">{userFeeds.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {!showPhotos ? (
          // Live Feeds View
          userFeeds.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🪞</div>
              <h2>No Active Feeds</h2>
              <p>Waiting for users to connect their mirrors...</p>
              <p className="hint">Tell users to open the User Portal and start their mirrors</p>
            </div>
          ) : (
            <div className="feeds-grid">
              {userFeeds.map((feed, index) => (
                <div
                  key={index}
                  className="feed-card"
                  onClick={() => handleUserClick(feed)}
                >
                  <button
                    className="feed-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFeed(feed.userId);
                    }}
                    title="Delete feed"
                  >
                    🗑️
                  </button>
                  <div className="feed-display">
                    {feed.imageData ? (
                      <img src={feed.imageData} alt={feed.userId} className="feed-image" />
                    ) : (
                      <div className="feed-placeholder">
                        <span>📹</span>
                      </div>
                    )}
                  </div>

                  <div className="feed-info">
                    <h3>{feed.userId}</h3>
                    <p className="feed-time">Updated: {formatTime(feed.timestamp)}</p>
                    <span className="status-badge">🟢 Live</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Photos Gallery View
          Object.keys(userPhotos).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📸</div>
              <h2>No Photos Yet</h2>
              <p>Users can capture photos by clicking the 📸 button on their mirrors</p>
            </div>
          ) : (
            <div className="photos-container">
              {Object.entries(userPhotos).map(([userId, photos]) => (
                <div key={userId} className="user-photos-section">
                  <h3 className="user-photos-title">📸 {userId}</h3>
                  <div className="photos-grid">
                    {photos.map((photo) => (
                      <div
                        key={photo.photoId}
                        className="photo-card"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img src={photo.imageData} alt={photo.photoId} />
                        <p className="photo-time">{formatTime(photo.timestamp)}</p>
                        <button
                          className="photo-delete-quick"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.photoId, photo.userId);
                          }}
                          title="Delete photo"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Detail View Modal */}
      {selectedUser && (
        <div className="detail-modal" onClick={handleCloseDetail}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail" onClick={handleCloseDetail}>✖</button>

            <h2>📹 {selectedUser.userId}</h2>

            <div className="detail-image-container">
              {selectedUser.imageData ? (
                <img src={selectedUser.imageData} alt={selectedUser.userId} />
              ) : (
                <div className="placeholder">No feed available</div>
              )}
            </div>

            <div className="detail-info">
              <p>
                <strong>User ID:</strong> {selectedUser.userId}
              </p>
              <p>
                <strong>Last Updated:</strong> {formatTime(selectedUser.timestamp)}
              </p>
              <p>
                <strong>Status:</strong> <span className="live-badge">🟢 Live</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="detail-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail" onClick={() => setSelectedPhoto(null)}>✖</button>

            <h2>📸 {selectedPhoto.userId}</h2>

            <div className="detail-image-container">
              <img src={selectedPhoto.imageData} alt={selectedPhoto.photoId} />
            </div>

            <div className="detail-info">
              <p>
                <strong>User:</strong> {selectedPhoto.userId}
              </p>
              <p>
                <strong>Captured:</strong> {formatTime(selectedPhoto.timestamp)}
              </p>
              {selectedPhoto.photoTime && (
                <p>
                  <strong>🕐 Time:</strong> {selectedPhoto.photoTime}
                </p>
              )}
              {selectedPhoto.location && (
                <p>
                  <strong>📍 Location:</strong> {selectedPhoto.location.lat.toFixed(4)}, {selectedPhoto.location.lng.toFixed(4)}
                </p>
              )}
              {selectedPhoto.filter && (
                <p>
                  <strong>✨ Filter:</strong> {selectedPhoto.filter}
                </p>
              )}
              <div className="photo-actions">
                <button 
                  className="download-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedPhoto.imageData;
                    link.download = `mirror-photo-${selectedPhoto.photoId}.jpg`;
                    link.click();
                  }}
                >
                  ⬇️ Download Photo
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => deletePhoto(selectedPhoto.photoId, selectedPhoto.userId)}
                >
                  🗑️ Delete Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
