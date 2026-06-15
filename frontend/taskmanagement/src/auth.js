const STORAGE_KEY = 'taskflow_users';
const SESSION_KEY = 'taskflow_current_user';
const TASKS_KEY = 'taskflow_tasks';

// Initialize default admin if no users exist
const initializeUsers = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@taskflow.com',
        password: 'admin123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        avatar: '👑'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  }
};

// Initialize sample tasks
const initializeTasks = () => {
  if (!localStorage.getItem(TASKS_KEY)) {
    const sampleTasks = [
      {
        id: 1,
        title: 'Design Dashboard UI',
        description: 'Create modern dashboard design with animations and responsive layout',
        priority: 'HIGH',
        status: 'TODO',
        assignedTo: 1,
        createdBy: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Implement Authentication',
        description: 'Add login/signup functionality with JWT tokens and protected routes',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assignedTo: 1,
        createdBy: 1,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Setup Database',
        description: 'Configure PostgreSQL and MongoDB connections with proper indexing',
        priority: 'HIGH',
        status: 'TODO',
        assignedTo: 1,
        createdBy: 1,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Write Documentation',
        description: 'Complete API documentation and user guide',
        priority: 'MEDIUM',
        status: 'DONE',
        assignedTo: 1,
        createdBy: 1,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        title: 'Deploy to Production',
        description: 'Setup Docker containers and deploy to cloud server',
        priority: 'URGENT',
        status: 'TODO',
        assignedTo: 1,
        createdBy: 1,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(TASKS_KEY, JSON.stringify(sampleTasks));
  }
};

initializeUsers();
initializeTasks();

export const auth = {
  register: (userData) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, error: 'Username already exists' };
    }
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    const isFirstUser = users.length === 0;
    
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: isFirstUser ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
      avatar: isFirstUser ? '👑' : '👤'
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true, user: userWithoutPassword };
  },
  
  login: (username, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid username or password' };
  },
  
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem(SESSION_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return localStorage.getItem(SESSION_KEY) !== null;
  },
  
  isAdmin: () => {
    const user = auth.getCurrentUser();
    return user && user.role === 'ADMIN';
  },
  
  getAllUsers: () => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return users.map(({ password, ...user }) => user);
  },
  
  deleteUser: (userId) => {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },
  
  updateUserRole: (userId, role) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      
      const currentUser = auth.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, role };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      }
    }
  }
};

export const taskAPI = {
  getAllTasks: () => {
    return JSON.parse(localStorage.getItem(TASKS_KEY));
  },
  
  getTasksByUser: (userId) => {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    return tasks.filter(t => t.assignedTo === userId);
  },
  
  createTask: (task) => {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const newTask = {
      ...task,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return newTask;
  },
  
  updateTaskStatus: (taskId, status) => {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = status;
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    return null;
  },
  
  updateTask: (taskId, updatedData) => {
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedData };
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    return null;
  },
  
  deleteTask: (taskId) => {
    let tasks = JSON.parse(localStorage.getItem(TASKS_KEY));
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
};