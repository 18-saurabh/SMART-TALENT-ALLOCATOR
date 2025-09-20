import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

function AppContent() {
  const { currentUser, userProfile } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/signin" 
            element={currentUser ? <Navigate to="/" replace /> : <SignIn />} 
          />
          <Route 
            path="/signup" 
            element={currentUser ? <Navigate to="/" replace /> : <SignUp />} 
          />
          <Route 
            path="/employee-dashboard" 
            element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager-dashboard" 
            element={
              <ProtectedRoute requiredRole="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="*" 
            element={
              currentUser ? (
                <Navigate to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'} replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;