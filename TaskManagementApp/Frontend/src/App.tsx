import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import { getTasks, Task } from './services/taskservice';
import './styles/App.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: { status: string; priority: string; assignee: string }) => {
    setFilters(newFilters);
  };

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter((task: Task) => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Assignee filter
    if (filters.assignee !== 'all' && task.assignedTo !== filters.assignee) {
      return false;
    }

    return true;
  });

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <Header onSearch={handleSearch} />
            
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard tasks={filteredTasks} />
                  </ProtectedRoute>
                } />
                
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <div className="tasks-page">
                      <CreateTask refreshTasks={fetchTasks} />
                      {loading ? (
                        <div className="loading">Loading tasks...</div>
                      ) : error ? (
                        <div className="error">{error}</div>
                      ) : (
                        <TaskList 
                          tasks={filteredTasks} 
                          refreshTasks={fetchTasks}
                          onFilterChange={handleFilterChange}
                        />
                      )}
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;