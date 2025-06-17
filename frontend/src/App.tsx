import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { RootState } from './store';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Add more protected routes as needed */}
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Transactions Page (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/transactions/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>New Transaction Form (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/budgets" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Budgets Page (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/budgets/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>New Budget Form (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Goals Page (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/goals/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>New Goal Form (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/investments" 
          element={
            <ProtectedRoute>
              <Layout>
                <div>Investments Page (To be implemented)</div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;