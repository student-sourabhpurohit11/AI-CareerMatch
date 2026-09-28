import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import ResumeAnalysis from './pages/ResumeAnalysis';
import JobMatches from './pages/JobMatches';
import Jobs from './pages/Jobs';
import SkillGap from './pages/SkillGap';
import CareerRecommendations from './pages/CareerRecommendations';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/resumes/:id/analysis" element={<ResumeAnalysis />} />
            <Route path="/matches" element={<JobMatches />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/career-paths" element={<CareerRecommendations />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Protected Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
