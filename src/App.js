// src/App.js  —  UPDATED VERSION
//
// Changes from original:
//   1. Wraps everything in <AuthProvider>
//   2. All routes are now protected (redirect to /login if no token)
//   3. tasks state is lifted here and loaded from the API on mount
//   4. /login route added (public)

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api';

import Sidebar          from './components/Sidebar';
import Dashboard        from './components/Dashboard';
import Pomodoro         from './components/Pomodoro';
import WeekSchedule     from './components/WeekSchedule';
import Progress         from './components/Progress';
import ExamDates        from './components/ExamDates';
import AccountSettings  from './components/AccountSettings';
import TaskAnalytics    from './components/TaskAnalytics';
import LoginPage        from './pages/LoginPage';

import './App.css';

// Inner component so it can use useAuth()
function AppInner() {
  const { user } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from backend whenever the logged-in user changes
  useEffect(() => {
    if (!user) { setTasks([]); setLoading(false); return; }

    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh',
                    background:'linear-gradient(135deg,#e0f7fa,#b2ebf2)', fontSize:'1.2rem', color:'#2c3e50' }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="app-container">
      {user && <Sidebar />}

      <main className="main-area">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard tasks={tasks} setTasks={setTasks} />
            </ProtectedRoute>
          } />
          <Route path="/pomodoro" element={
            <ProtectedRoute><Pomodoro /></ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <WeekSchedule tasks={tasks} setTasks={setTasks} />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute><Progress /></ProtectedRoute>
          } />
          <Route path="/exams" element={
            <ProtectedRoute><ExamDates /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><AccountSettings /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute><TaskAnalytics /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInner />
      </Router>
    </AuthProvider>
  );
}
