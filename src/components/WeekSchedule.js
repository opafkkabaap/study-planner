// src/components/WeekSchedule.jsx
import { useState } from 'react';
import './WeekSchedule.css';

export default function WeekSchedule({ tasks, setTasks }) {
  const [tempMonth, setTempMonth] = useState('april');
  const [tempWeek, setTempWeek] = useState('week1');
  const [tempYear, setTempYear] = useState('2026');

  const [selectedMonth, setSelectedMonth] = useState('april');
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [selectedYear, setSelectedYear] = useState('2026');

  const [activeDay, setActiveDay] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const weeks = ['week1', 'week2', 'week3', 'week4', 'week5'];
  const years = ['2025', '2026', '2027'];

  const days = [1, 2, 3, 4, 5, 6, 7];

  const handleSubmit = () => {
    setSelectedMonth(tempMonth);
    setSelectedWeek(tempWeek);
    setSelectedYear(tempYear);
    setSubmitMessage('Week updated successfully! ✅');
    setTimeout(() => setSubmitMessage(''), 2000);
  };

  // ────────────────────────────────────────────────
  //  Shared tasks logic
  // ────────────────────────────────────────────────

  const getTasksForDay = (day) => {
    // Safe guard: if tasks is undefined → return empty array
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(t => t.date === day);
  };

  const addTaskToDay = () => {
    if (!newTaskText.trim() || !currentDay) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
      date: currentDay,
      category: 'present',
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  const toggleTaskDone = (taskId) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const openDayModal = (day) => {
    setCurrentDay(day);
    setActiveDay(day);
    setShowTaskModal(true);
    setNewTaskText('');
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setCurrentDay(null);
    setNewTaskText('');
  };

  const getDaySummary = (day) => {
    const dayTasks = getTasksForDay(day);
    const total = dayTasks.length;
    const pending = dayTasks.filter(t => !t.done).length;
    if (total === 0) return null;
    return { total, pending };
  };

  return (
    <div className="schedule-wrapper">
      <div className="schedule-header">
        <div className="selector-group">
          <select value={tempMonth} onChange={e => setTempMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={tempWeek} onChange={e => setTempWeek(e.target.value)}>
            {weeks.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <select value={tempYear} onChange={e => setTempYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>

        {submitMessage && <div className="submit-message">{submitMessage}</div>}
      </div>

      <h2>your tasks for the week</h2>

      <div className="week-grid">
        {days.map(day => {
          const summary = getDaySummary(day);
          const hasPending = summary && summary.pending > 0;

          return (
            <div
              key={day}
              className={`day-card ${activeDay === day ? 'active' : ''} ${hasPending ? 'has-pending' : ''}`}
              onClick={() => openDayModal(day)}
            >
              <span className="day-number">{day}</span>
              {summary && (
                <div className="day-summary">
                  {summary.total} task{summary.total !== 1 ? 's' : ''}
                  {hasPending && <span className="pending-badge">{summary.pending} pending</span>}
                </div>
              )}
            </div>
          );
        })}

        <div className="week-summary-card">
          <div className="summary-content">
            <h4>{selectedWeek}</h4>
            <p>{selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}</p>
            <p>{selectedYear}</p>
          </div>
        </div>
      </div>

      {showTaskModal && currentDay && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="task-modal" onClick={e => e.stopPropagation()}>
            <h3>Tasks for Day {currentDay} — Feb {currentDay}, {selectedYear}</h3>

            <div className="task-input-area">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="Add new task..."
                onKeyDown={e => e.key === 'Enter' && addTaskToDay()}
              />
              <button className="add-task-btn" onClick={addTaskToDay}>+</button>
            </div>

            <div className="task-list-container">
              {getTasksForDay(currentDay).length === 0 ? (
                <p className="no-tasks">No tasks yet — add some!</p>
              ) : (
                <ul className="task-list">
                  {getTasksForDay(currentDay).map(task => (
                    <li key={task.id} className={task.done ? 'done' : ''}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTaskDone(task.id)}
                      />
                      <span className="task-text">{task.text}</span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}