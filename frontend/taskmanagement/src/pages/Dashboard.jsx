import React, { useState, useEffect } from 'react';
import { auth, taskAPI } from '../auth';
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.getCurrentUser();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const allTasks = taskAPI.getAllTasks();
    const userTasks = allTasks.filter(t => t.assignedTo === user.id);
    setTasks(userTasks);
    setLoading(false);
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    urgent: tasks.filter(t => t.priority === 'URGENT').length,
    high: tasks.filter(t => t.priority === 'HIGH').length,
    dueSoon: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0 && t.status !== 'DONE';
    }).length
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'URGENT': return '🔴';
      case 'HIGH': return '🟡';
      case 'MEDIUM': return '🔵';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'TODO': return 'status-todo';
      case 'IN_PROGRESS': return 'status-progress';
      case 'DONE': return 'status-done';
      default: return '';
    }
  };

  const recentTasks = tasks.slice(0, 5);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>📊 Welcome back, {user.firstName}! 👋</h1>
        <p>Here's what's happening with your tasks today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card todo-stat">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.todo}</h3>
            <p>To Do</p>
          </div>
        </div>
        <div className="stat-card progress-stat">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card done-stat">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.done}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card urgent-stat">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3>{stats.urgent}</h3>
            <p>Urgent</p>
          </div>
        </div>
        <div className="stat-card due-stat">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <h3>{stats.dueSoon}</h3>
            <p>Due Soon</p>
          </div>
        </div>
      </div>

      <div className="recent-tasks-section">
        <div className="section-header">
          <h2>📝 Recent Tasks</h2>
          <a href="/tasks" className="view-all">View All →</a>
        </div>
        
        {recentTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks yet. Create your first task!</p>
            <a href="/tasks" className="create-btn">+ Create Task</a>
          </div>
        ) : (
          <div className="recent-tasks-list">
            {recentTasks.map(task => (
              <div key={task.id} className={`recent-task-card ${getStatusClass(task.status)}`}>
                <div className="task-header">
                  <span className="task-priority-badge">{getPriorityIcon(task.priority)} {task.priority}</span>
                  <span className="task-status-badge">{task.status}</span>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description?.substring(0, 100)}...</p>
                <div className="task-footer">
                  <span>📅 Due: {task.dueDate}</span>
                  <a href={`/tasks`} className="view-task">View Task →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="progress-section">
        <h2>📈 Progress Overview</h2>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-label">
              <span>TODO</span>
              <span>{stats.todo} tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill todo-fill" style={{ width: `${(stats.todo / stats.total) * 100 || 0}%` }}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-label">
              <span>IN PROGRESS</span>
              <span>{stats.inProgress} tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill progress-fill" style={{ width: `${(stats.inProgress / stats.total) * 100 || 0}%` }}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-label">
              <span>COMPLETED</span>
              <span>{stats.done} tasks</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill done-fill" style={{ width: `${(stats.done / stats.total) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;