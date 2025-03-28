import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext'; 
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import CreateTask from './components/CreateTask';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import EditTask from './components/EditTask';
import AdminPanel from './components/AdminPanel';
import ManagerDashboard from './components/ManagerDashboard';
import NotFound from './components/NotFound';
import Unauthorized from './components/Unauthorized';
// Import only one App.css file to avoid conflicts
import './styles/App.css';
import { useTask } from './context/TaskContext';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: { status: string; priority: string; assignee: string }) => {
    setFilters(newFilters);
  };
  const { tasks, refreshTasks } = useTask();

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <div className="app">
                <Header onSearch={handleSearch} />
                <main className="main-content">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Dashboard searchTerm={searchTerm} filters={filters} />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/tasks" element={
                      <ProtectedRoute>
                        <div className="tasks-page">
                          <CreateTask />
                          <TaskList 
                            searchTerm={searchTerm}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            tasks={tasks}
                            refreshTasks={refreshTasks}
                          />
                        </div>
                      </ProtectedRoute>
                    } />

                    <Route path="/tasks/:taskId" element={
                      <ProtectedRoute>
                        <EditTask refreshTasks={refreshTasks} />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <AdminPanel />
                      </ProtectedRoute>
                    } />

                    {/* Manager routes */}
                    <Route path="/manager" element={
                      <ProtectedRoute requiredRoles={['manager', 'admin']}>
                        <ManagerDashboard />
                      </ProtectedRoute>
                    } />

                    {/* Error routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
