import React, { useState } from 'react';
import { auth, taskAPI } from '../auth';
import './Profile.css';

function Profile() {
  const user = auth.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  });
  const [message, setMessage] = useState('');

  const tasks = taskAPI.getAllTasks();
  const userTasks = tasks.filter(t => t.assignedTo === user.id);
  
  const stats = {
    total: userTasks.length,
    completed: userTasks.filter(t => t.status === 'DONE').length,
    inProgress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: userTasks.filter(t => t.status === 'TODO').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleSave = () => {
    // In real app, update user in database
    setMessage('Profile updated successfully!');
    setIsEditing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon">{user.avatar || '👤'}</span>
        </div>
        <div className="profile-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p className="user-role">{user.role}</p>
          <p className="user-since">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>📋 Account Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
            ) : (
              <button className="save-btn" onClick={handleSave}>💾 Save Changes</button>
            )}
          </div>
          
          {!isEditing ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <p>{user.username}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <label>First Name</label>
                <p>{user.firstName}</p>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <p>{user.lastName}</p>
              </div>
              <div className="info-item">
                <label>Role</label>
                <p>{user.role}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p>#{user.id}</p>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="profile-card">
          <h2>📊 Activity Summary</h2>
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.todo}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="completion-rate">
            <div className="rate-label">Completion Rate</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
            </div>
            <div className="rate-value">{completionRate}%</div>
          </div>
        </div>

        <div className="profile-card">
          <h2>🔐 Security</h2>
          <button className="change-password-btn">Change Password</button>
          <p className="security-note">Last password change: 30 days ago</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;