// src/components/Dashboard.jsx
import { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const todayDay = 8; // February 08, 2026

  const exams = [
    { id: 1, subject: 'DSA PAT', date: 9, month: 'Feb', year: 2026 },
    { id: 2, subject: 'Maths Midterm', date: 15, month: 'Feb', year: 2026 },
    { id: 3, subject: 'Physics Lab', date: 22, month: 'Feb', year: 2026 },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, text: "Morning Yoga Bliss", done: false, category: "present", date: 8 },
    { id: 2, text: "DSA - Binary Search revision", done: false, category: "present", date: 8 },
    { id: 3, text: "Physics - Mechanics notes", done: true, category: "present", date: 8 },
    { id: 4, text: "Maths - Calculus 50 problems", done: false, category: "pending", date: 10 },
    { id: 5, text: "English vocab Day 12", done: false, category: "pending", date: 12 },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayDay);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  const presentTasks = tasks.filter(t => t.category === "present");
  const pendingTasks = tasks.filter(t => t.category === "pending");

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
      category: "present",
      date: selectedDate,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText("");
    setSelectedDate(todayDay);
    setShowAddModal(false);
  };

  const toggleDone = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const moveToPending = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, category: "pending" } : task
      )
    );
  };

  // New: Open add modal with pre-selected date from calendar click
  const handleCalendarClick = (day) => {
    setSelectedDate(day);
    setShowAddModal(true);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <h1>Welcome back! </h1>

        <div className="cards-grid">
          {/* Present day work */}
          <div className="card present-day">
            <h3>Today's Work (Feb {todayDay})</h3>
            {presentTasks.length === 0 ? (
              <p className="empty-text">Add some tasks to crush today!</p>
            ) : (
              <ul className="task-list">
                {presentTasks.map(task => (
                  <li key={task.id} className={task.done ? "done" : ""}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(task.id)}
                    />
                    <div className="task-info">
                      <span className="task-text">{task.text}</span>
                      <small className="task-date">Feb {task.date}</small>
                    </div>
                    {!task.done && (
                      <button
                        className="move-btn"
                        onClick={() => moveToPending(task.id)}
                      >
                        → Pending
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

         {/* Pending tasks */}
<div className="card pending-tasks">
  <h3>Pending Tasks</h3>
  {pendingTasks.length === 0 ? (
    // ────────────────────────────────────────────────
    //     This is the improved empty state logic
    // ────────────────────────────────────────────────
    tasks.some(t => t.category === "pending") ? (
      <p className="empty-text">All pending tasks completed! 🎉</p>
    ) : (
      <p className="empty-text">No pending tasks yet 🏆</p>
    )
  ) : (
    <ul className="task-list">
      {pendingTasks.map(task => (
        <li key={task.id} className={task.done ? "done" : ""}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => toggleDone(task.id)}
          />
          <div className="task-info">
            <span className="task-text">{task.text}</span>
            <small className="task-date">Feb {task.date}</small>
          </div>
        </li>
      ))}
    </ul>
  )}
</div> 

          {/* Interactive Calendar */}
          <div className="card calendar-preview">
            <h3>February 2026</h3>
            <div className="mini-calendar">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const isToday = day === todayDay;
                const hasExam = exams.some(e => e.date === day);
                return (
                  <div
                    key={day}
                    className={`calendar-day 
                      ${isToday ? "today" : ""} 
                      ${hasExam ? "exam" : ""}`}
                    onClick={() => handleCalendarClick(day)}
                    role="button"
                    tabIndex={0}
                    title={`Add task for Feb ${day}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="calendar-hint">Click any date to add a task for that day</p>
          </div>
        </div>

        <div className="action-row">
          <button
            className="btn add-tasks-btn"
            onClick={() => {
              setSelectedDate(todayDay);
              setShowAddModal(true);
            }}
          >
            Add Task 
          </button>
          <button
            className="btn exam-notif-btn"
            onClick={() => setShowExamModal(true)}
          >
            Exam Notification
          </button>
        </div>
      </div>

      {/* Add Task Modal – now date can come from calendar click */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Task for Feb {selectedDate}</h3>
            <input
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="e.g. Revise Thermodynamics Ch 3"
              autoFocus
            />
            <div className="date-picker">
              <label>Change Date:</label>
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(Number(e.target.value))}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    Feb {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="add-btn" onClick={addTask}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Notification Modal (unchanged) */}
      {showExamModal && (
        <div className="modal-backdrop" onClick={() => setShowExamModal(false)}>
          <div className="exam-modal" onClick={e => e.stopPropagation()}>
            <h3>Upcoming Exams</h3>
            {exams.length === 0 ? (
              <p>No exams scheduled yet.</p>
            ) : (
              <ul className="exam-list">
                {exams.map(ex => (
                  <li key={ex.id}>
                    <strong>{ex.subject}</strong>
                    <span> – {ex.month} {ex.date}, {ex.year}</span>
                  </li>
                ))}
              </ul>
            )}
            <button className="close-btn" onClick={() => setShowExamModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}