import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleUserClick = () => {
    const userName = prompt('Enter your name:')?.trim() || `User-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userName);
    navigate('/user');
  };

  const handleAdminClick = () => {
    const password = prompt('Enter Admin Password:');
    if (password === '1234') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      alert('❌ Wrong password!');
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="logo">✨ Smart Mirror</div>


        <div className="buttons-container">
          <button className="btn btn-user" onClick={handleUserClick}>
            <span className="icon">👤</span>
            <span>User Portal</span>
          </button>

          <button className="btn btn-admin" onClick={handleAdminClick}>
            <span className="icon">👨‍💼</span>
            <span>Admin Dashboard</span>
          </button>
        </div>

        <p className="hint">Tap to start 💕</p>
      </div>

      <div className="background-animation"></div>
    </div>
  );
}

export default LandingPage;
