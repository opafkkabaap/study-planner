import { useState } from 'react';
import api from '../api';
import './WeekSchedule.css';

export default function WeekSchedule({ tasks, setTasks }) {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  const now = new Date();
  const currentMonthName = months[now.getMonth()];
  const currentYearStr = String(now.getFullYear());
  const weekOfMonth = `week${Math.ceil(now.getDate() / 7)}`;

  const [tempMonth, setTempMonth] = useState(currentMonthName);
  const [tempWeek, setTempWeek] = useState(weekOfMonth);
  const [tempYear, setTempYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedWeek, setSelectedWeek] = useState(weekOfMonth);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  const [activeDay, setActiveDay] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  
  const [newTaskText, setNewTaskText] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [completionError, setCompletionError] = useState('');   // For required field validation

  const weeksInMonth = (monthName, year) => {
    const monthIdx = months.indexOf(monthName.toLowerCase());
    const daysInMonth = new Date(parseInt(year), monthIdx + 1, 0).getDate();
    return Math.ceil(daysInMonth / 7);
  };

  const weeks = Array.from(
    { length: weeksInMonth(selectedMonth, selectedYear) },
    (_, i) => `week${i + 1}`
  );

  const years = [
    String(now.getFullYear() - 1),
    String(now.getFullYear()),
    String(now.getFullYear() + 1),
  ];

  const getDaysForWeek = (weekStr, monthName, year) => {
    const weekNum = parseInt(weekStr.replace('week', ''));
    const monthIdx = months.indexOf(monthName.toLowerCase());
    const daysInMonth = new Date(parseInt(year), monthIdx + 1, 0).getDate();
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    const result = [];
    for (let d = startDay; d <= endDay; d++) result.push(d);
    return result;
  };

  const days = getDaysForWeek(selectedWeek, selectedMonth, selectedYear);

  const monthIndex = (monthName) => months.indexOf(monthName.toLowerCase());

  const handleSubmit = () => {
    setSelectedMonth(tempMonth);
    setSelectedWeek(tempWeek);
    setSelectedYear(tempYear);
    setSubmitMessage('Week updated successfully! ✅');
    setTimeout(() => setSubmitMessage(''), 2000);
  };

  const getTasksForDay = (day) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(t =>
      t.day === day &&
      t.month === monthIndex(selectedMonth) &&
      t.year === parseInt(selectedYear)
    );
  };

  const addTaskToDay = async () => {
    if (!newTaskText.trim()) return;
    if (!estimatedCompletion) {
      setCompletionError('Estimated completion time is required');
      return;
    }

    try {
      const { data } = await api.post('/tasks', {
        text: newTaskText.trim(),
        day: currentDay,
        month: monthIndex(selectedMonth),
        year: parseInt(selectedYear),
        estimatedCompletion: estimatedCompletion,   // Required field
      });
      setTasks(prev => [...prev, data]);
      
      // Reset form
      setNewTaskText('');
      setEstimatedCompletion('');
      setCompletionError('');
      
    } catch (err) {
      console.error('Add task failed', err);
    }
  };

  const toggleTaskDone = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    try {
      const { data } = await api.patch(`/tasks/${taskId}`, { done: !task.done });
      setTasks(prev => prev.map(t => t._id === taskId ? data : t));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openDayModal = (day) => {
    setCurrentDay(day);
    setActiveDay(day);
    setShowTaskModal(true);
    setNewTaskText('');
    setEstimatedCompletion('');
    setCompletionError('');
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setActiveDay(null);
    setNewTaskText('');
    setEstimatedCompletion('');
    setCompletionError('');
  };

  const getDaySummary = (day) => {
    const dayTasks = getTasksForDay(day);
    const total = dayTasks.length;
    const pending = dayTasks.filter(t => !t.done).length;
    return total === 0 ? null : { total, pending };
  };

  return (
    <div className="schedule-wrapper">
      <div className="schedule-header">
        <div className="selector-group">
          <select value={tempMonth} onChange={e => {
            const newMonth = e.target.value;
            setTempMonth(newMonth);
            const maxWeeks = weeksInMonth(newMonth, tempYear);
            const currentWeekNum = parseInt(tempWeek.replace('week', ''));
            if (currentWeekNum > maxWeeks) setTempWeek(`week${maxWeeks}`);
          }}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={tempWeek} onChange={e => setTempWeek(e.target.value)}>
            {Array.from(
              { length: weeksInMonth(tempMonth, tempYear) },
              (_, i) => `week${i + 1}`
            ).map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={tempYear} onChange={e => setTempYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="submit-btn" onClick={handleSubmit}>Update View</button>
        </div>
        {submitMessage && <div className="submit-message">{submitMessage}</div>}
      </div>

      <h2>Your tasks</h2>

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
              <span className="day-label">{selectedMonth.slice(0, 3).toUpperCase()}</span>
              <span className="day-number">{day}</span>
              {summary && (
                <div className="day-summary">
                  {summary.total} {summary.total === 1 ? 'task' : 'tasks'}
                  {hasPending && <span className="pending-badge">{summary.pending}</span>}
                </div>
              )}
            </div>
          );
        })}

        <div className="week-summary-card">
          <div className="summary-content">
            <span className="summary-icon">🗓️</span>
            <h4>{selectedWeek}</h4>
            <p className="summary-sub">{selectedMonth}</p>
            <p className="summary-year">{selectedYear}</p>
          </div>
        </div>
      </div>

      {/* Task Modal - Improved UI with Required Estimated Time */}
      {showTaskModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="task-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Day {currentDay} — {selectedMonth} {selectedYear}</h3>
            </div>

            <div className="task-input-area">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="What needs to be done?"
                onKeyDown={e => e.key === 'Enter' && addTaskToDay()}
                autoFocus
              />
              <button className="add-task-btn" onClick={addTaskToDay}>+</button>
            </div>

            {/* Required Estimated Completion Time - Improved UI */}
            <div className="estimated-time-section">
              <label className="required-label">
                Estimated Completion Time <span className="required-star">*</span>
              </label>
              <input
                type="datetime-local"
                value={estimatedCompletion}
                onChange={e => {
                  setEstimatedCompletion(e.target.value);
                  setCompletionError('');   // Clear error when user selects time
                }}
                className={`datetime-input ${completionError ? 'error-input' : ''}`}
                required
              />
              {completionError && <p className="completion-error">{completionError}</p>}
              <small className="helper-text">
                When do you plan to finish this task? (Required)
              </small>
            </div>

            <div className="task-list-container">
              {getTasksForDay(currentDay).length === 0 ? (
                <div className="no-tasks"><p>No tasks for this day yet.</p></div>
              ) : (
                <ul className="task-list">
                  {getTasksForDay(currentDay).map(task => (
                    <li key={task._id} className={task.done ? 'done' : ''}>
                      <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => toggleTaskDone(task._id)} 
                      />
                      <span className="task-text">{task.text}</span>
                      <button className="delete-btn" onClick={() => deleteTask(task._id)}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="close-modal-btn" onClick={closeModal}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}