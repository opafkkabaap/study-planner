// src/components/ExamDates.jsx
import { useState } from 'react';
import './ExamDates.css';

export default function ExamDates() {
  const [exams, setExams] = useState([
    {
      id: 1,
      title: "DSA PAT",
      date: "09/01/2026",
      subject: "Data Structures & Algorithms",
    },
    {
      id: 2,
      title: "Maths Midterm",
      date: "15/02/2026",
      subject: "Calculus & Linear Algebra",
    },
    {
      id: 3,
      title: "Physics Semester End",
      date: "22/03/2026",
      subject: "Mechanics & Thermodynamics",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    date: '',
    subject: '',
  });

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Current view: February 2026
  const today = new Date(2026, 1, 9); // Feb 9, 2026
  const currentMonth = 1; // February
  const currentYear = 2026;

  const addExam = () => {
    if (!newExam.title || !newExam.date || !newExam.subject) {
      alert("Please fill Title, Date, and Subject");
      return;
    }

    // Basic date format check (DD/MM/YYYY)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newExam.date)) {
      alert("Date must be in DD/MM/YYYY format");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...newExam,
    };

    setExams(prev => [...prev, newEntry]);
    setNewExam({ title: '', date: '', subject: '' });
    setShowAddModal(false);
  };

  const hasExamOnDay = (day) => {
    return exams.some(e => {
      const [d, m, y] = e.date.split('/').map(Number);
      return d === day && m === (currentMonth + 1) && y === currentYear;
    });
  };

  const isToday = (day) => {
    return day === today.getDate() && today.getMonth() === currentMonth;
  };

  return (
    <div className="exam-wrapper">
      <h1>your scheduled exam dates</h1>

      <div className="exam-content">
        {/* Calendar */}
        <div className="calendar-box">
          <div className="calendar-header">
            <h3>February 2026</h3>
          </div>
          
          <div className="calendar-body">
            <div className="calendar-grid">
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1;
                const examDay = hasExamOnDay(day);
                const todayDay = isToday(day);

                return (
                  <div
                    key={day}
                    className={`calendar-day 
                      ${examDay ? 'exam-day' : ''} 
                      ${todayDay ? 'today' : ''}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="calendar-note">
              Red marks = exam days • Blue border = today (9th)
            </p>
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
                  <li key={exam.id} className="exam-item">
                    <div className="exam-date-badge">
                      <span className="day">{d}</span>
                      <span className="month">{monthNames[parseInt(m) - 1]}</span>
                    </div>
                    <div className="exam-info">
                      <h4>{exam.title}</h4>
                      <p className="subject">{exam.subject}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button 
            className="add-exam-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add New Exam
          </button>
        </div>
      </div>

      {/* Add Exam Modal – no notes field */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-exam-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Exam</h3>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newExam.title}
                onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                placeholder="e.g. DSA PAT"
              />
            </div>

            <div className="form-group">
              <label>Date (DD/MM/YYYY)</label>
              <input
                type="text"
                value={newExam.date}
                onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                placeholder="09/01/2026"
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={newExam.subject}
                onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                placeholder="Data Structures & Algorithms"
              />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={addExam}>
                Save Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}