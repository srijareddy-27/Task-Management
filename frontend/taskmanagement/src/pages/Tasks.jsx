import React, { useState, useEffect } from 'react';
import { auth, taskAPI } from '../auth';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: null,
    dueDate: ''
  });

  const user = auth.getCurrentUser();
  const isAdmin = auth.isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allTasks = taskAPI.getAllTasks();
    const userTasks = isAdmin ? allTasks : allTasks.filter(t => t.assignedTo === user.id);
    setTasks(userTasks);
    setUsers(auth.getAllUsers());
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return '#dc3545';
      case 'HIGH': return '#ffc107';
      case 'MEDIUM': return '#17a2b8';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
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

  const createTask = () => {
    if (!newTask.title) {
      alert('Please enter task title');
      return;
    }

    taskAPI.createTask({
      ...newTask,
      assignedTo: newTask.assignedTo || user.id,
      createdBy: user.id,
      status: 'TODO'
    });
    
    setShowAddModal(false);
    setNewTask({ title: '', description: '', priority: 'MEDIUM', assignedTo: null, dueDate: '' });
    loadData();
  };

  const updateStatus = (taskId, newStatus) => {
    taskAPI.updateTaskStatus(taskId, newStatus);
    loadData();
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      taskAPI.deleteTask(taskId);
      loadData();
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const progressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>✅ Task Management</h1>
        <button className="add-task-btn" onClick={() => setShowAddModal(true)}>
          + Add New Task
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search tasks by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="column-header todo-header">
            <h2>📝 To Do</h2>
            <span className="task-count">{todoTasks.length}</span>
          </div>
          <div className="column-tasks">
            {todoTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                  {getPriorityIcon(task.priority)} {task.priority}
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span>👤 {users.find(u => u.id === task.assignedTo)?.firstName || 'Unassigned'}</span>
                  <span>📅 {task.dueDate || 'No date'}</span>
                </div>
                <div className="task-actions">
                  <button onClick={() => updateStatus(task.id, 'IN_PROGRESS')} className="start-btn">Start</button>
                  <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {todoTasks.length === 0 && <div className="empty-column">No tasks in To Do</div>}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header progress-header">
            <h2>⚡ In Progress</h2>
            <span className="task-count">{progressTasks.length}</span>
          </div>
          <div className="column-tasks">
            {progressTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                  {getPriorityIcon(task.priority)} {task.priority}
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span>👤 {users.find(u => u.id === task.assignedTo)?.firstName || 'Unassigned'}</span>
                  <span>📅 {task.dueDate || 'No date'}</span>
                </div>
                <div className="task-actions">
                  <button onClick={() => updateStatus(task.id, 'DONE')} className="complete-btn">Complete</button>
                  <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {progressTasks.length === 0 && <div className="empty-column">No tasks in progress</div>}
          </div>
        </div>

        <div className="kanban-column">
          <div className="column-header done-header">
            <h2>✅ Done</h2>
            <span className="task-count">{doneTasks.length}</span>
          </div>
          <div className="column-tasks">
            {doneTasks.map(task => (
              <div key={task.id} className="task-card done-card">
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                  {getPriorityIcon(task.priority)} {task.priority}
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span>👤 {users.find(u => u.id === task.assignedTo)?.firstName || 'Unassigned'}</span>
                  <span>📅 {task.dueDate || 'No date'}</span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
              </div>
            ))}
            {doneTasks.length === 0 && <div className="empty-column">No completed tasks</div>}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add New Task</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter task description"
                  rows="4"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="LOW">🟢 LOW</option>
                    <option value="MEDIUM">🔵 MEDIUM</option>
                    <option value="HIGH">🟡 HIGH</option>
                    <option value="URGENT">🔴 URGENT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={newTask.assignedTo || ''}
                    onChange={(e) => setNewTask({...newTask, assignedTo: parseInt(e.target.value)})}
                  >
                    <option value="">Select user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.username})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="create-btn" onClick={createTask}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;