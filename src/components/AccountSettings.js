import { useState } from 'react';
import './AccountSettings.css';

export default function AccountSettings() {
  const [name, setName] = useState('Srimannath');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name cannot be empty');
      return;
    }
    setSaveMessage('Name updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="settings-wrapper">
      <h1>account settings</h1>

      <div className="settings-content">
        {/* Name Change Section */}
        <div className="settings-card">
          <div className="card-header">
            <h3>Profile Details</h3>
            <div className="card-icon"></div>
          </div>
          
          <form onSubmit={handleSaveName} className="settings-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <button type="submit" className="action-btn save-btn">
              Update Profile
            </button>
          </form>
          {saveMessage && <p className="success-msg">{saveMessage}</p>}
        </div>

        {/* Auth Section */}
        {/* <div className="settings-card dark-card">
          <div className="card-header">
            <h3>Signin Status</h3>
            <div className="card-icon"></div>
          </div>
          
          <div className="auth-status">
            <p className="status-label">Current Status</p>
            <div className={`status-badge ${isLoggedIn ? 'active' : 'inactive'}`}>
              {isLoggedIn ? 'Signed In' : 'Signed Out'}
            </div>
            <p className="status-desc">
              {isLoggedIn 
                ? `Logged in as ${name}` 
                : 'Please sign in to access all features'}
            </p>
          </div>

          <button 
            className={`action-btn ${isLoggedIn ? 'logout-btn' : 'signin-btn'}`}
            onClick={() => setIsLoggedIn(!isLoggedIn)}
          >
            {isLoggedIn ? 'Log Out' : 'Sign In'}
          </button>
        </div> */}
      </div>
    </div>
  );
}