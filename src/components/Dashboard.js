// src/components/Dashboard.js  —  UPDATED VERSION
//
// Key changes from original:
//   • Tasks come from props (set by App.js via API) — no more hardcoded useState
//   • addTask()     → POST /api/tasks
//   • toggleDone()  → PATCH /api/tasks/:id
//   • postponeTask() → PATCH /api/tasks/:id  (move date back one day)
//   • MongoDB uses _id not id — all .map(t => t._id) updated
//   • exams loaded from GET /api/exams on mount

import { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';

export default function Dashboard({ tasks, setTasks }) {
  const today      = new Date();
  const todayDay   = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear  = today.getFullYear();

  const [viewDate, setViewDate] = useState(new Date());
  const currentMonth = viewDate.getMonth();
  const currentYear  = viewDate.getFullYear();
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName    = viewDate.toLocaleString('default', { month: 'long' });

  const [exams, setExams]               = useState([]);
  const [newTaskText, setNewTaskText]   = useState('');
  const [selectedDate, setSelectedDate] = useState(todayDay);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [taskError, setTaskError]       = useState('');

  // Load exams from backend
  useEffect(() => {
    api.get('/exams').then(res => setExams(res.data)).catch(console.error);
  }, []);

  // ── Filtering (same logic, just _id instead of id) ─────────────────
  const presentTasks = tasks.filter(t =>
    t.day === todayDay && t.month === todayMonth && t.year === todayYear
  );

  const pendingTasks = tasks.filter(t => {
    const taskDate  = new Date(t.year, t.month, t.day);
    const todayDate = new Date(todayYear, todayMonth, todayDay);
    return taskDate < todayDate && !t.done;
  });

  const changeMonth = (offset) =>
    setViewDate(new Date(currentYear, currentMonth + offset, 1));

  // ── API-backed handlers ─────────────────────────────────────────────

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const { data } = await api.post('/tasks', {
        text: newTaskText.trim(),
        day: selectedDate,
        month: currentMonth,
        year: currentYear,
      });
      setTasks(prev => [...prev, data]);
      setNewTaskText('');
      setShowAddModal(false);
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const toggleDone = async (id) => {
    const task = tasks.find(t => t._id === id);
    try {
      const { data } = await api.patch(`/tasks/${id}`, { done: !task.done });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const postponeTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    const d = new Date(task.year, task.month, task.day);
    d.setDate(d.getDate() - 1);
    try {
      const { data } = await api.patch(`/tasks/${id}`, {
        day: d.getDate(), month: d.getMonth(), year: d.getFullYear(),
      });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      console.error('Postpone failed', err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <h1>Welcome back 👋🏼</h1>

        <div className="cards-grid">
          {/* Today's Tasks */}
          <div className="card present-day">
            <h3>Today's Work</h3>
            {presentTasks.length === 0 ? (
              <p className="empty-text">Add tasks to crush today!</p>
            ) : (
              <ul className="task-list">
                {presentTasks.map(task => (
                  <li key={task._id} className={task.done ? 'done' : ''}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleDone(task._id)} />
                    <span className="task-text">{task.text}</span>
                    {!task.done && (
                      <button className="move-btn" onClick={() => postponeTask(task._id)}>
                        → Pending
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending */}
          <div className="card pending-block">
            <h3 className="warning-title">Pending</h3>
            {pendingTasks.length === 0 ? (
              <p className="empty-text">All caught up! 🏆</p>
            ) : (
              <ul className="task-list">
                {pendingTasks.map(task => (
                  <li key={task._id} className="overdue-item">
                    <input type="checkbox" checked={task.done} onChange={() => toggleDone(task._id)} />
                    <div className="task-info">
                      <span className="task-text">{task.text}</span>
                      <small className="task-date">Due: {task.month + 1}/{task.day}/{task.year}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mini Calendar */}
          <div className="card calendar-preview">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)}>←</button>
              <h3>{monthName} {currentYear}</h3>
              <button onClick={() => changeMonth(1)}>→</button>
            </div>
            <div className="mini-calendar">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday  = day === todayDay && currentMonth === todayMonth && currentYear === todayYear;
                const hasExam  = exams.some(e => {
                  if (!e.date) return false;
                  const [d, m, y] = e.date.split('/').map(Number);
                  return d === day && m === currentMonth + 1 && y === currentYear;
                });
                const hasTask  = tasks.some(t => t.day === day && t.month === currentMonth && t.year === currentYear);
                return (
                  <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''} ${hasExam ? 'exam' : ''} ${hasTask ? 'has-task' : ''}`}
                    onClick={() => { setSelectedDate(day); setShowAddModal(true); }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-row">
          <button className="btn add-tasks-btn" onClick={() => { setSelectedDate(todayDay); setShowAddModal(true); }}>
            Add Task
          </button>
          <button className="btn exam-notif-btn" onClick={() => setShowExamModal(true)}>
            Exam Schedule
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h3>New Task: {monthName} {selectedDate}, {currentYear}</h3>
            {taskError && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{taskError}</p>}
            <input
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn add-btn" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="modal-backdrop" onClick={() => setShowExamModal(false)}>
          <div className="exam-modal" onClick={e => e.stopPropagation()}>
            <h3>Upcoming Exams</h3>
            <ul className="exam-list">
              {exams.map(exam => (
                <li key={exam._id}>
                  <strong>{exam.title}</strong> – {exam.date} &nbsp;
                  <span style={{ color: '#3498db' }}>{exam.subject}</span>
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setShowExamModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
