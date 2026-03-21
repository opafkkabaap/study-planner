// src/components/AccountSettings.js  —  UPDATED VERSION
//
// Changes from original:
//   • Name pre-filled from AuthContext user (real logged-in name)
//   • Save name → PATCH /api/settings/name, then refreshes auth context
//   • Password change section re-enabled → PATCH /api/settings/password
//   • Logout button wired to AuthContext logout()

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './AccountSettings.css';

export default function AccountSettings() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName]             = useState(user?.name || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [nameError, setNameError]   = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [pwMessage, setPwMessage]             = useState('');
  const [pwError, setPwError]                 = useState('');

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameError('');
    if (!name.trim()) { setNameError('Name cannot be empty'); return; }
    try {
      await api.patch('/settings/name', { name });
      await refreshUser(); // update AuthContext + localStorage
      setSaveMessage('Name updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!currentPassword || !newPassword) { setPwError('Both fields are required'); return; }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    try {
      await api.patch('/settings/password', { currentPassword, newPassword });
      setPwMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPwMessage(''), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-wrapper">
      <h1>account settings</h1>

      <div className="settings-content">
        {/* Profile Name Card */}
        <div className="settings-card">
          <div className="card-header">
            <h3>Profile Details</h3>
            <div className="card-icon">👤</div>
          </div>

          <form onSubmit={handleSaveName} className="settings-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            {nameError && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{nameError}</p>}
            <button type="submit" className="action-btn save-btn">Update Profile</button>
          </form>
          {saveMessage && <p className="success-msg">{saveMessage}</p>}

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #eee' }} />

          <button className="action-btn logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Password Change Card */}
        <div className="settings-card dark-card">
          <div className="card-header">
            <h3>Change Password</h3>
            <div className="card-icon">🔒</div>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
                style={{ background: '#2a2a2a', color: 'white', border: '1px solid #444' }}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ background: '#2a2a2a', color: 'white', border: '1px solid #444' }}
              />
            </div>
            {pwError && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{pwError}</p>}
            <button type="submit" className="action-btn signin-btn">Update Password</button>
          </form>
          {pwMessage && <p className="success-msg">{pwMessage}</p>}
        </div>
      </div>
    </div>
  );
}
