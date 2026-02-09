import { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const todayDay = 8;
  const currentMonth = "Feb";
  const currentYear = 2026;
  const daysInFeb = 28; // 2026 is not a leap year

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

  const presentTasks = tasks.filter(t => t.date === todayDay);
  const otherTasks = tasks.filter(t => t.date !== todayDay);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
      category: selectedDate === todayDay ? "present" : "pending",
      date: selectedDate,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText("");
    setShowAddModal(false);
  };

  const toggleDone = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const handleCalendarClick = (day) => {
    setSelectedDate(day);
    setShowAddModal(true);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <h1>Welcome back!</h1>

        <div className="cards-grid">
          <div className="card present-day">
            <h3>Today's Work ({currentMonth} {todayDay})</h3>
            {presentTasks.length === 0 ? (
              <p className="empty-text">Add some tasks to crush today!</p>
            ) : (
              <ul className="task-list">
                {presentTasks.map(task => (
                  <li key={task.id} className={task.done ? "done" : ""}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} />
                    <div className="task-info">
                      <span className="task-text">{task.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card pending-tasks">
            <h3>Upcoming/Other Tasks</h3>
            {otherTasks.length === 0 ? (
              <p className="empty-text">No other tasks scheduled 🏆</p>
            ) : (
              <ul className="task-list">
                {otherTasks.map(task => (
                  <li key={task.id} className={task.done ? "done" : ""}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} />
                    <div className="task-info">
                      <span className="task-text">{task.text}</span>
                      <small className="task-date">{currentMonth} {task.date}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card calendar-preview">
            <h3>{currentMonth} {currentYear}</h3>
            <div className="mini-calendar">
              {Array.from({ length: daysInFeb }, (_, i) => {
                const day = i + 1;
                const isToday = day === todayDay;
                const hasExam = exams.some(e => e.date === day);
                const hasTask = tasks.some(t => t.date === day);
                return (
                  <div
                    key={day}
                    className={`calendar-day ${isToday ? "today" : ""} ${hasExam ? "exam" : ""} ${hasTask ? "has-task" : ""}`}
                    onClick={() => handleCalendarClick(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="calendar-hint">Click a date to schedule</p>
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

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h3>New Task for {currentMonth} {selectedDate}</h3>
            <input
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
            
            <p className="picker-label">Select Date:</p>
            <div className="modal-mini-calendar">
               {Array.from({ length: daysInFeb }, (_, i) => {
                const day = i + 1;
                return (
                  <div 
                    key={day} 
                    className={`picker-day ${selectedDate === day ? "selected" : ""} ${day === todayDay ? "is-today" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {showExamModal && (
        <div className="modal-backdrop" onClick={() => setShowExamModal(false)}>
          <div className="exam-modal" onClick={e => e.stopPropagation()}>
            <h3>Upcoming Exams</h3>
            <ul className="exam-list">
              {exams.map(ex => (
                <li key={ex.id}>
                  <strong>{ex.subject}</strong> — {ex.month} {ex.date}
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