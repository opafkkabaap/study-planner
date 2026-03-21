// src/components/Progress.js  —  UPDATED VERSION
//
// Changes from original:
//   • Fetches real progress entries from GET /api/progress?view=week|month|year
//   • Keeps the existing bar chart UI intact — just replaces hardcoded data
//   • "Log Hours" button opens a small modal to POST /api/progress
//   • Falls back to 0 gracefully if no data exists yet

import { useState, useEffect } from 'react';
import api from '../api';
import './Progress.css';

// The two subjects tracked — matches original chart legend
const SUBJECTS = ['Maths', 'Physics'];
const COLORS   = { Maths: '#3498db', Physics: '#8e44ad' };

export default function Progress() {
  const [viewMode, setViewMode] = useState('week');
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Log hours modal
  const [showLog, setShowLog]   = useState(false);
  const [logSubject, setLogSubject] = useState('Maths');
  const [logHours, setLogHours] = useState('');
  const [logMsg, setLogMsg]     = useState('');

  const now = new Date();

  const fetchProgress = () => {
    setLoading(true);
    api.get('/progress', {
      params: { view: viewMode, month: now.getMonth(), year: now.getFullYear() },
    })
      .then(res => setEntries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProgress(); }, [viewMode]); // eslint-disable-line

  // ── Aggregate entries into chart-friendly format ────────────────────
  const buildChartData = () => {
    if (entries.length === 0) return null;

    // Group by day or week or month depending on viewMode
    const buckets = {};
    entries.forEach(e => {
      let label;
      if (viewMode === 'week') {
        label = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][new Date(e.logDate).getDay() - 1] || 'Sun';
      } else if (viewMode === 'month') {
        const w = Math.ceil(e.day / 7);
        label = `Wk ${w}`;
      } else {
        label = new Date(e.logDate).toLocaleString('default', { month: 'short' });
      }
      if (!buckets[label]) buckets[label] = { Maths: 0, Physics: 0 };
      buckets[label][e.subject] = (buckets[label][e.subject] || 0) + e.hours;
    });

    const items   = Object.keys(buckets);
    const series1 = items.map(k => buckets[k].Maths);
    const series2 = items.map(k => buckets[k].Physics);
    const highest = Math.max(...series1, ...series2, 0);

    // Today total
    const todayHours = entries
      .filter(e => e.day === now.getDate() && e.month === now.getMonth() && e.year === now.getFullYear())
      .reduce((s, e) => s + e.hours, 0);

    return { items, series1, series2, highest, todayHours };
  };

  const logProgress = async (e) => {
    e.preventDefault();
    if (!logHours || isNaN(logHours)) return;
    try {
      await api.post('/progress', {
        subject: logSubject,
        hours: parseFloat(logHours),
        day: now.getDate(), month: now.getMonth(), year: now.getFullYear(),
      });
      setLogMsg('Hours logged!');
      fetchProgress();
      setTimeout(() => { setLogMsg(''); setShowLog(false); setLogHours(''); }, 1500);
    } catch (err) {
      setLogMsg(err.response?.data?.message || 'Error logging hours');
    }
  };

  // Fallback static data while empty (matches original UI exactly)
  const staticData = {
    week:  { items: ['Mon','Tue','Wed'], series1: [0,0,0], series2: [0,0,0], highest: 0, todayHours: 0 },
    month: { items: ['Wk 1','Wk 2','Wk 3'], series1: [0,0,0], series2: [0,0,0], highest: 0, todayHours: 0 },
    year:  { items: ['Jan','Feb','Mar'], series1: [0,0,0], series2: [0,0,0], highest: 0, todayHours: 0 },
  };

  const current  = buildChartData() || staticData[viewMode];
  const maxValue = Math.max(...current.series1, ...current.series2, 1);

  return (
    <div className="progress-wrapper">
      <h1>my track</h1>

      <div className="view-selector">
        {['week', 'month', 'year'].map(mode => (
          <button key={mode} className={viewMode === mode ? 'active' : ''} onClick={() => setViewMode(mode)}>
            {mode}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading…</p>
      ) : (
        <div className="progress-content">
          <div className="chart-area">
            <div className="chart-header">
              <span className="series-label"><span className="dot series1"></span> Maths</span>
              <span className="series-label"><span className="dot series2"></span> Physics</span>
            </div>

            <div className="bars-container">
              {current.items.map((item, index) => {
                const val1      = current.series1[index];
                const val2      = current.series2[index];
                const height1   = (val1 / maxValue) * 100;
                const height2   = (val2 / maxValue) * 100;
                const isHighest = Math.max(val1, val2) === current.highest && current.highest > 0;

                return (
                  <div key={`${viewMode}-${item}`} className="bar-group">
                    <div className="bar-wrapper">
                      <div className="bar series1" style={{ height: `${height1}%` }} title={`Maths: ${val1}h`} />
                      <div className="bar series2" style={{ height: `${height2}%` }} title={`Physics: ${val2}h`} />
                    </div>
                    <div className="bar-label-container">
                      <span className="bar-label">{item}</span>
                      {isHighest && <span className="highest-tag">highest</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stats-area">
            <div className="stat-circle highest">
              <div className="circle-content">
                <span className="value">{current.highest}h</span>
                <span className="label">highest record till today</span>
              </div>
            </div>
            <div className="stat-circle today">
              <div className="circle-content">
                <span className="value">{current.todayHours}h</span>
                <span className="label">studied today</span>
              </div>
            </div>
            <button
              onClick={() => setShowLog(true)}
              style={{ padding:'0.8rem 1.5rem', background:'#2c3e50', color:'white',
                       border:'none', borderRadius:'12px', fontWeight:600, cursor:'pointer' }}
            >
              + Log Hours
            </button>
          </div>
        </div>
      )}

      {/* Log Hours Modal */}
      {showLog && (
        <div className="modal-backdrop" onClick={() => setShowLog(false)}>
          <div style={{ background:'white', borderRadius:'16px', padding:'2rem', width:'340px',
                        boxShadow:'0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#2c3e50', marginBottom:'1.2rem' }}>Log Study Hours – Today</h3>

            <form onSubmit={logProgress} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700,
                                 color:'#7f8c8d', marginBottom:'0.4rem' }}>Subject</label>
                <select value={logSubject} onChange={e => setLogSubject(e.target.value)}
                  style={{ width:'100%', padding:'0.8rem', borderRadius:'10px', border:'1px solid #ddd', fontSize:'1rem' }}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700,
                                 color:'#7f8c8d', marginBottom:'0.4rem' }}>Hours</label>
                <input type="number" step="0.5" min="0" max="24"
                  value={logHours} onChange={e => setLogHours(e.target.value)}
                  placeholder="e.g. 2.5"
                  style={{ width:'100%', padding:'0.8rem', borderRadius:'10px', border:'1px solid #ddd', fontSize:'1rem' }} />
              </div>
              {logMsg && <p style={{ color: logMsg.includes('!') ? '#27ae60' : '#e74c3c' }}>{logMsg}</p>}
              <div style={{ display:'flex', gap:'1rem' }}>
                <button type="button" onClick={() => setShowLog(false)}
                  style={{ flex:1, padding:'0.8rem', background:'#ecf0f1', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600 }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex:1, padding:'0.8rem', background:'#27ae60', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600 }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
