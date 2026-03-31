import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import './App.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
