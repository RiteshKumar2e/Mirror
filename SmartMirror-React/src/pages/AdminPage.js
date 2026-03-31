import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [userFeeds, setUserFeeds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshRate, setRefreshRate] = useState(1);
  const [statsUpdateTime, setStatsUpdateTime] = useState(new Date());

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
    }, refreshRate * 1000);

    return () => clearInterval(pollInterval);
  }, [refreshRate]);

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
        {userFeeds.length === 0 ? (
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
        )}
      </div>

      {/* Detail View Modal */}
      {selectedUser && (
        <div className="detail-modal" onClick={handleCloseDetail}>
          <div className="detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-detail" onClick={handleCloseDetail}>✖</button>

            <h2>{selectedUser.userId}</h2>

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
    </div>
  );
}

export default AdminPage;
