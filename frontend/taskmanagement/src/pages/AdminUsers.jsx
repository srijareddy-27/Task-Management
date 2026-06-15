import React, { useState, useEffect } from 'react';
import { auth } from '../auth';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = auth.getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account!');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      auth.deleteUser(userId);
      loadUsers();
    }
  };

  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser.id && newRole !== currentUser.role) {
      alert('You cannot change your own role!');
      return;
    }
    auth.updateUserRole(userId, newRole);
    loadUsers();
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.email) {
      alert('Please fill all required fields');
      return;
    }

    const result = auth.register(newUser);
    if (result.success) {
      setShowAddModal(false);
      setNewUser({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'USER' });
      loadUsers();
    } else {
      alert(result.error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <h1>👥 User Management</h1>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          + Add New User
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card admin-stat">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
          </div>
        </div>
        <div className="stat-card user-stat">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Regular Users</p>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search users by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td className="avatar-cell">
                  <span className="user-avatar">{user.avatar || (user.role === 'ADMIN' ? '👑' : '👤')}</span>
                </td>
                <td>{user.firstName} {user.lastName}</td>
                <td>@{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`role-select ${user.role === 'ADMIN' ? 'admin-role' : 'user-role'}`}
                    disabled={user.id === currentUser.id}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button 
                    className="delete-user-btn"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentUser.id}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="no-results">No users found matching your search.</div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New User</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="USER">Regular User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="create-btn" onClick={handleAddUser}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;