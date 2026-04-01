import { useState, useEffect } from 'react';
import api from '../api';
import './Dashboard.css';
import ClockDial from './ClockDial'; // Integrated here

// ── helpers ───────────────────────────────────────────────────────────────
const fmtDate = (month, day) => {
  const d = new Date(2000, month, day);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const fmtTime = iso =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

export default function Dashboard({ tasks, setTasks }) {
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const [viewDate, setViewDate] = useState(new Date());
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const [exams, setExams] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayDay);
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [timeError, setTimeError] = useState('');

  // Load exams
  useEffect(() => {
    api.get('/exams').then(r => setExams(r.data)).catch(console.error);
  }, []);

  // ── Derived task lists ──────────────────────────────────────────────────
  const todayDate = new Date(todayYear, todayMonth, todayDay);

  const presentTasks = tasks.filter(t =>
    t.day === todayDay && t.month === todayMonth && t.year === todayYear
  );

  const pendingTasks = tasks.filter(t => {
    const taskDate = new Date(t.year, t.month, t.day);
    return taskDate < todayDate && !t.done;
  });

  const upcomingTasks = tasks
    .filter(t => {
      const taskDate = new Date(t.year, t.month, t.day);
      const diffDays = Math.ceil((taskDate - todayDate) / (1000 * 3600 * 24));
      return diffDays > 0 && diffDays <= 7 && !t.done;
    })
    .sort((a, b) => new Date(a.year, a.month, a.day) - new Date(b.year, b.month, b.day));

  // ── Actions ─────────────────────────────────────────────────────────────
  const changeMonth = offset => setViewDate(new Date(currentYear, currentMonth + offset, 1));

  const moveToPending = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const yesterday = new Date(todayYear, todayMonth, todayDay);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const { data } = await api.patch(`/tasks/${id}`, {
        day: yesterday.getDate(),
        month: yesterday.getMonth(),
        year: yesterday.getFullYear(),
      });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      console.error('Failed to move task to pending:', err);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) {
      setTaskError('Please enter a task description');
      return;
    }
    if (selectedHour === null) {
      setTimeError('Please select completion time');
      return;
    }

    const completionDate = new Date(currentYear, currentMonth, selectedDate);
    completionDate.setHours(selectedHour, selectedMinute, 0, 0);

    try {
      const { data } = await api.post('/tasks', {
        text: newTaskText.trim(),
        day: selectedDate,
        month: currentMonth,
        year: currentYear,
        estimatedCompletion: completionDate.toISOString(),
      });
      setTasks(prev => [...prev, data]);
      closeAddModal();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to add task');
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewTaskText('');
    setSelectedHour(10);
    setSelectedMinute(0);
    setTaskError('');
    setTimeError('');
  };

  const openAddModal = (day = todayDay) => {
    setSelectedDate(day);
    setSelectedHour(10);
    setSelectedMinute(0);
    setNewTaskText('');
    setTaskError('');
    setTimeError('');
    setShowAddModal(true);
  };

  const toggleDone = async id => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    try {
      const { data } = await api.patch(`/tasks/${id}`, { done: !task.done });
      setTasks(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        <h1>Welcome back 👋</h1>

        <div className="cards-grid">
          {/* Today's Work */}
          <div className="card present-day">
            <h3>Today's Work</h3>
            {presentTasks.length === 0 ? (
              <p className="empty-text">Nothing scheduled — enjoy the calm!</p>
            ) : (
              <ul className="task-list">
                {presentTasks.map(task => (
                  <li key={task._id} className={task.done ? 'done' : ''}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleDone(task._id)} />
                    <span className="task-text">{task.text}</span>
                    {!task.done && (
                      <button className="move-btn" onClick={() => moveToPending(task._id)}>
                        → Pending
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Tasks */}
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
                      <small className="task-date">Due: {fmtDate(task.month, task.day)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="card upcoming-block">
            <h3>Upcoming</h3>
            {upcomingTasks.length === 0 ? (
              <p className="empty-text">Nothing in the next 7 days 🎉</p>
            ) : (
              <ul className="task-list">
                {upcomingTasks.map(task => {
                  const taskDate = new Date(task.year, task.month, task.day);
                  const diffDays = Math.ceil((taskDate - todayDate) / (1000 * 3600 * 24));
                  return (
                    <li key={task._id} className="upcoming-item">
                      <input type="checkbox" checked={task.done} onChange={() => toggleDone(task._id)} />
                      <div className="task-info">
                        <span className="task-text">{task.text}</span>
                        <small className="task-date">
                          {diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`} · {fmtDate(task.month, task.day)}
                          {task.estimatedCompletion && <> · Est: {fmtTime(task.estimatedCompletion)}</>}
                        </small>
                      </div>
                    </li>
                  );
                })}
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

            <div className="calendar-weekdays">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="mini-calendar">
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday = day === todayDay && currentMonth === todayMonth && currentYear === todayYear;
                const hasExam = exams.some(e => {
                  if (!e.date) return false;
                  const [d, m, y] = e.date.split('/').map(Number);
                  return d === day && m === currentMonth + 1 && y === currentYear;
                });
                const hasTask = tasks.some(t => t.day === day && t.month === currentMonth && t.year === currentYear);

                return (
                  <div
                    key={day}
                    className={[
                      'calendar-day',
                      isToday ? 'today' : '',
                      hasExam ? 'exam' : '',
                      hasTask ? 'has-task' : ''
                    ].join(' ').trim()}
                    onClick={() => openAddModal(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-row">
          <button className="btn add-tasks-btn" onClick={() => openAddModal()}>+ Add Task</button>
          <button className="btn exam-notif-btn" onClick={() => setShowExamModal(true)}>Exam Schedule</button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h3>New Task — {monthName} {selectedDate}, {currentYear}</h3>

            {taskError && <p className="error-text">{taskError}</p>}

            <input
              type="text"
              value={newTaskText}
              onChange={e => { setNewTaskText(e.target.value); setTaskError(''); }}
              placeholder="What needs to be done?"
              autoFocus
            />

            <div className="estimated-time-section">
              <label className="required-label">
                Estimated Completion Time <span className="required-star">*</span>
              </label>

              <input
                type="date"
                value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  setSelectedDate(d);
                }}
                className="datetime-input"
                style={{ marginBottom: '1.5rem' }}
              />

              {/* Using your custom ClockDial component here */}
              <ClockDial
                initialHour={selectedHour}
                initialMinute={selectedMinute}
                onChange={({ hour, minute }) => {
                  setSelectedHour(hour);
                  setSelectedMinute(minute);
                  setTimeError('');
                }}
              />

              {timeError && <span className="error-text" style={{ display: 'block', marginTop: '0.5rem' }}>{timeError}</span>}
            </div>

            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={closeAddModal}>Cancel</button>
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
            {exams.length === 0 ? (
              <p className="empty-text">No exams scheduled.</p>
            ) : (
              <ul className="exam-list">
                {exams.map(exam => (
                  <li key={exam._id}>
                    <strong>{exam.title}</strong> <span>{exam.date}</span>
                    {exam.subject && <span style={{ color: '#4a6cf7', fontWeight: 500 }}>{exam.subject}</span>}
                  </li>
                ))}
              </ul>
            )}
            <button className="close-btn" onClick={() => setShowExamModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}