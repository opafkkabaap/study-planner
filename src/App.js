// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import WeekSchedule from './components/WeekSchedule';
import Progress from './components/Progress';  
import ExamDates from './components/ExamDates';
import AccountSettings from './components/AccountSettings';



import './App.css';

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Morning Yoga Bliss", done: false, date: 8, category: "present" },
    { id: 2, text: "DSA - Binary Search revision", done: false, date: 8, category: "present" },
    { id: 3, text: "Physics - Mechanics notes", done: true, date: 8, category: "present" },
    { id: 4, text: "Maths - Calculus 50 problems", done: false, date: 10, category: "pending" },
    { id: 5, text: "English vocab Day 12", done: false, date: 12, category: "pending" },
  ]);

  return (
    <Router>
      <div className="app-container">
        <Sidebar />

        <main className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} setTasks={setTasks} />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/schedule" element={<WeekSchedule tasks={tasks} setTasks={setTasks} />} />
            <Route path="/progress" element={<Progress />} />  
            <Route path="/exams" element={<ExamDates />} />
            <Route path="/account" element={<AccountSettings />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;