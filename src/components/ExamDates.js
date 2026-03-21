// src/components/ExamDates.js  —  UPDATED VERSION
//
// Changes from original:
//   • Loads exams from GET /api/exams on mount
//   • addExam()    → POST /api/exams
//   • deleteExam() → DELETE /api/exams/:_id  (new button added)
//   • Calendar now correctly reflects the current real month
//   • All exam ids use _id (MongoDB)

import { useState, useEffect } from 'react';
import api from '../api';
import './ExamDates.css';

export default function ExamDates() {
  const [exams, setExams]           = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam]       = useState({ title: '', date: '', subject: '' });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  // Use real today for calendar
  const today        = new Date();
  const currentMonth = today.getMonth();      // 0-indexed
  const currentYear  = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthLabel  = today.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    api.get('/exams')
      .then(res => setExams(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addExam = async () => {
    if (!newExam.title || !newExam.date || !newExam.subject) {
      setError('Please fill in all fields'); return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newExam.date)) {
      setError('Date must be in DD/MM/YYYY format'); return;
    }
    try {
      const { data } = await api.post('/exams', newExam);
      setExams(prev => [...prev, data]);
      setNewExam({ title: '', date: '', subject: '' });
      setShowAddModal(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Remove this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const hasExamOnDay = (day) =>
    exams.some(e => {
      const [d, m, y] = e.date.split('/').map(Number);
      return d === day && m === currentMonth + 1 && y === currentYear;
    });

  const isToday = (day) => day === today.getDate();

  if (loading) return <div className="exam-wrapper"><p>Loading…</p></div>;

  return (
    <div className="exam-wrapper">
      <h1>your scheduled exam dates</h1>

      <div className="exam-content">
        {/* Calendar */}
        <div className="calendar-box">
          <div className="calendar-header">
            <h3>{monthLabel} {currentYear}</h3>
          </div>
          <div className="calendar-body">
            <div className="calendar-grid">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return (
                  <div
                    key={day}
                    className={`calendar-day ${hasExamOnDay(day) ? 'exam-day' : ''} ${isToday(day) ? 'today' : ''}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="calendar-note">Red = exam day • Blue border = today</p>
          </div>
        </div>

        {/* Exam List */}
        <div className="exam-list-container">
          {exams.length === 0 ? (
            <p className="no-exams">No exams scheduled yet.</p>
          ) : (
            <ul className="exam-list">
              {exams.map(exam => {
                const [d, m] = exam.date.split('/');
                return (
                  <li key={exam._id} className="exam-item">
                    <div className="exam-date-badge">
                      <span className="day">{d}</span>
                      <span className="month">{monthNames[parseInt(m) - 1]}</span>
                    </div>
                    <div className="exam-info" style={{ flex: 1 }}>
                      <h4>{exam.title}</h4>
                      <p className="subject">{exam.subject}</p>
                    </div>
                    <button
                      onClick={() => deleteExam(exam._id)}
                      style={{
                        background: 'none', border: 'none', color: '#e74c3c',
                        fontSize: '1.3rem', cursor: 'pointer', padding: '0 0.5rem',
                      }}
                      title="Delete exam"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button className="add-exam-btn" onClick={() => setShowAddModal(true)}>
            + Add New Exam
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-exam-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Exam</h3>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}

            <div className="form-group">
              <label>Title</label>
              <input type="text" value={newExam.title}
                onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                placeholder="e.g. DSA PAT" />
            </div>
            <div className="form-group">
              <label>Date (DD/MM/YYYY)</label>
              <input type="text" value={newExam.date}
                onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                placeholder="21/03/2026" />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" value={newExam.subject}
                onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                placeholder="Data Structures & Algorithms" />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowAddModal(false); setError(''); }}>
                Cancel
              </button>
              <button className="save-btn" onClick={addExam}>Save Exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
