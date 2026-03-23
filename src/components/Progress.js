import { useState, useEffect } from 'react';
import api from '../api';
import './Progress.css';

// Preset color palette for subjects
const COLOR_PALETTE = [
  '#3498db','#8e44ad','#e74c3c','#27ae60',
  '#f39c12','#16a085','#d35400','#2980b9',
  '#8e44ad','#c0392b',
];

const DEFAULT_SUBJECTS = [
  { name: 'Maths',   color: '#3498db' },
  { name: 'Physics', color: '#8e44ad' },
];

export default function Progress() {
  const [viewMode, setViewMode]     = useState('week');
  const [entries, setEntries]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [subjects, setSubjects]     = useState(() => {
    try {
      const saved = localStorage.getItem('sp_subjects');
      return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
    } catch { return DEFAULT_SUBJECTS; }
  });

  // Log hours modal
  const [showLog, setShowLog]           = useState(false);
  const [logSubject, setLogSubject]     = useState('');
  const [logHours, setLogHours]         = useState('');
  const [logMsg, setLogMsg]             = useState('');

  // Manage subjects modal
  const [showManage, setShowManage]     = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#3498db');
  const [manageError, setManageError]   = useState('');

  const now = new Date();

  // persist subjects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sp_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // keep logSubject in sync if subjects list changes
  useEffect(() => {
    if (subjects.length > 0 && !subjects.find(s => s.name === logSubject)) {
      setLogSubject(subjects[0].name);
    }
  }, [subjects, logSubject]);

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

  // ── ADD SUBJECT ──────────────────────────────────────────────────────
  const addSubject = () => {
    const name = newSubjectName.trim();
    if (!name) { setManageError('Subject name cannot be empty'); return; }
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setManageError('Subject already exists'); return;
    }
    if (subjects.length >= 8) {
      setManageError('Maximum 8 subjects allowed'); return;
    }
    setSubjects(prev => [...prev, { name, color: newSubjectColor }]);
    setNewSubjectName('');
    setNewSubjectColor(COLOR_PALETTE[subjects.length % COLOR_PALETTE.length]);
    setManageError('');
  };

  // ── DELETE SUBJECT ───────────────────────────────────────────────────
  const deleteSubject = (name) => {
    if (subjects.length <= 1) {
      setManageError('You need at least one subject'); return;
    }
    setSubjects(prev => prev.filter(s => s.name !== name));
    setManageError('');
  };

  // ── BUILD CHART DATA ─────────────────────────────────────────────────
  const buildChartData = () => {
    const buckets = {};
    entries.forEach(e => {
      let label;
      if (viewMode === 'week') {
        label = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][new Date(e.logDate).getDay() - 1] || 'Sun';
      } else if (viewMode === 'month') {
        label = `Wk ${Math.ceil(e.day / 7)}`;
      } else {
        label = new Date(e.logDate).toLocaleString('default', { month: 'short' });
      }
      if (!buckets[label]) {
        const init = {};
        subjects.forEach(s => { init[s.name] = 0; });
        buckets[label] = init;
      }
      if (buckets[label][e.subject] !== undefined) {
        buckets[label][e.subject] += e.hours;
      }
    });

    // fallback buckets when no data
    if (Object.keys(buckets).length === 0) {
      const fallbackLabels = {
        week:  ['Mon','Tue','Wed'],
        month: ['Wk 1','Wk 2','Wk 3'],
        year:  ['Jan','Feb','Mar'],
      }[viewMode];
      fallbackLabels.forEach(l => {
        const init = {};
        subjects.forEach(s => { init[s.name] = 0; });
        buckets[l] = init;
      });
    }

    const items   = Object.keys(buckets);
    const highest = Math.max(0, ...items.flatMap(k =>
      subjects.map(s => buckets[k][s.name] || 0)
    ));
    const todayHours = entries
      .filter(e => e.day === now.getDate() && e.month === now.getMonth() && e.year === now.getFullYear())
      .reduce((sum, e) => sum + e.hours, 0);

    return { items, buckets, highest, todayHours };
  };

  // ── LOG PROGRESS ─────────────────────────────────────────────────────
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

  const { items, buckets, highest, todayHours } = buildChartData();
  const maxValue = Math.max(highest, 1);

  const inputStyle = {
    width:'100%', padding:'0.8rem', borderRadius:'10px',
    border:'1px solid #ddd', fontSize:'1rem',
  };
  const labelStyle = {
    display:'block', fontSize:'0.85rem', fontWeight:700,
    color:'#7f8c8d', marginBottom:'0.4rem', textTransform:'uppercase',
  };

  return (
    <div className="progress-wrapper">
      <h1>my track</h1>

      {/* view selector */}
      <div className="view-selector">
        {['week','month','year'].map(mode => (
          <button key={mode} className={viewMode===mode?'active':''} onClick={() => setViewMode(mode)}>
            {mode}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#7f8c8d' }}>Loading…</p>
      ) : (
        <div className="progress-content">

          {/* ── CHART ── */}
          <div className="chart-area">
            {/* legend */}
            <div className="chart-header" style={{ flexWrap:'wrap', gap:'0.6rem' }}>
              {subjects.map(s => (
                <span key={s.name} className="series-label">
                  <span className="dot" style={{ background: s.color }}></span>
                  {s.name}
                </span>
              ))}
            </div>

            <div className="bars-container">
              {items.map(item => {
                const vals    = subjects.map(s => buckets[item][s.name] || 0);
                const maxVal  = Math.max(...vals);
                const isHighest = maxVal === highest && highest > 0;

                return (
                  <div key={`${viewMode}-${item}`} className="bar-group">
                    <div className="bar-wrapper">
                      {subjects.map(s => {
                        const val = buckets[item][s.name] || 0;
                        const h   = (val / maxValue) * 100;
                        return (
                          <div
                            key={s.name}
                            className="bar"
                            style={{ height:`${h}%`, background: s.color }}
                            title={`${s.name}: ${val}h`}
                          />
                        );
                      })}
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

          {/* ── STATS ── */}
          <div className="stats-area">
            <div className="stat-circle highest">
              <div className="circle-content">
                <span className="value">{highest}h</span>
                <span className="label">highest record till today</span>
              </div>
            </div>
            <div className="stat-circle today">
              <div className="circle-content">
                <span className="value">{todayHours}h</span>
                <span className="label">studied today</span>
              </div>
            </div>

            <button onClick={() => { setLogSubject(subjects[0]?.name||''); setShowLog(true); }}
              style={{ padding:'0.8rem 1.5rem', background:'#2c3e50', color:'white',
                       border:'none', borderRadius:'12px', fontWeight:600, cursor:'pointer', width:'100%' }}>
              + Log Hours
            </button>

            <button onClick={() => setShowManage(true)}
              style={{ padding:'0.8rem 1.5rem', background:'rgba(44,62,80,0.08)', color:'#2c3e50',
                       border:'1.5px solid rgba(44,62,80,0.2)', borderRadius:'12px',
                       fontWeight:600, cursor:'pointer', width:'100%' }}>
              ⚙ Manage Subjects
            </button>
          </div>
        </div>
      )}

      {/* ── LOG HOURS MODAL ── */}
      {showLog && (
        <div className="modal-backdrop" onClick={() => setShowLog(false)}>
          <div style={{ background:'white', borderRadius:'16px', padding:'2rem', width:'340px',
                        boxShadow:'0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#2c3e50', marginBottom:'1.2rem' }}>Log Study Hours — Today</h3>
            <form onSubmit={logProgress} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={logSubject} onChange={e => setLogSubject(e.target.value)} style={inputStyle}>
                  {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Hours</label>
                <input type="number" step="0.5" min="0" max="24"
                  value={logHours} onChange={e => setLogHours(e.target.value)}
                  placeholder="e.g. 2.5" style={inputStyle} />
              </div>
              {logMsg && <p style={{ color: logMsg.includes('!')? '#27ae60':'#e74c3c', margin:0 }}>{logMsg}</p>}
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

      {/* ── MANAGE SUBJECTS MODAL ── */}
      {showManage && (
        <div className="modal-backdrop" onClick={() => setShowManage(false)}>
          <div style={{ background:'white', borderRadius:'16px', padding:'2rem', width:'400px',
                        maxHeight:'85vh', overflowY:'auto',
                        boxShadow:'0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#2c3e50', marginBottom:'1.5rem' }}>Manage Subjects</h3>

            {/* existing subjects list */}
            <div style={{ marginBottom:'1.5rem' }}>
              {subjects.map(s => (
                <div key={s.name} style={{
                  display:'flex', alignItems:'center', gap:'0.8rem',
                  padding:'0.75rem 1rem', borderRadius:'10px',
                  background:'#f8f9fa', marginBottom:'0.5rem',
                }}>
                  <div style={{
                    width:14, height:14, borderRadius:'50%',
                    background: s.color, flexShrink:0,
                  }}/>
                  <span style={{ flex:1, fontWeight:600, color:'#2c3e50' }}>{s.name}</span>
                  <button
                    onClick={() => deleteSubject(s.name)}
                    style={{
                      background:'none', border:'none', color:'#e74c3c',
                      fontSize:'1.3rem', cursor:'pointer', lineHeight:1, padding:'0 4px',
                    }}
                    title="Delete subject"
                  >×</button>
                </div>
              ))}
            </div>

            {/* add new subject */}
            <div style={{ borderTop:'1px solid #eee', paddingTop:'1.2rem' }}>
              <p style={{ fontWeight:700, color:'#2c3e50', marginBottom:'0.8rem', fontSize:'0.9rem' }}>
                ADD NEW SUBJECT
              </p>
              <div style={{ display:'flex', gap:'0.6rem', marginBottom:'0.8rem' }}>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={e => { setNewSubjectName(e.target.value); setManageError(''); }}
                  placeholder="e.g. Chemistry"
                  onKeyDown={e => e.key === 'Enter' && addSubject()}
                  style={{ ...inputStyle, flex:1, padding:'0.7rem' }}
                />
                {/* color picker */}
                <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={e => setNewSubjectColor(e.target.value)}
                    style={{
                      width:44, height:40, border:'1px solid #ddd',
                      borderRadius:10, cursor:'pointer', padding:2,
                    }}
                    title="Pick color"
                  />
                </div>
              </div>

              {/* color preset swatches */}
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'0.8rem' }}>
                {COLOR_PALETTE.map(c => (
                  <div
                    key={c}
                    onClick={() => setNewSubjectColor(c)}
                    style={{
                      width:22, height:22, borderRadius:'50%', background:c,
                      cursor:'pointer', border: newSubjectColor===c ? '2px solid #2c3e50' : '2px solid transparent',
                      transition:'transform 0.15s',
                    }}
                  />
                ))}
              </div>

              {manageError && (
                <p style={{ color:'#e74c3c', fontSize:'0.85rem', marginBottom:'0.8rem' }}>{manageError}</p>
              )}

              <div style={{ display:'flex', gap:'1rem' }}>
                <button onClick={() => setShowManage(false)}
                  style={{ flex:1, padding:'0.8rem', background:'#ecf0f1', border:'none',
                           borderRadius:'10px', cursor:'pointer', fontWeight:600 }}>
                  Done
                </button>
                <button onClick={addSubject}
                  style={{ flex:1, padding:'0.8rem', background:'#2c3e50', color:'white',
                           border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:600 }}>
                  + Add Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}