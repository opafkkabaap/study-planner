import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api';
import './TaskAnalytics.css';

const toNum = d => new Date(d).getTime() / (1000 * 60 * 60);

const fmtDateTime = d =>
  new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

const toInputVal = d => {
  if (!d) return '';
  const dt = new Date(d);
  const pad = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmtDuration = (totalHours) => {
  const h = Math.abs(Math.round(totalHours));
  const days = Math.floor(h / 24);
  const remainingHours = h % 24;
  
  if (days === 0) return `${remainingHours}h`;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
};

export default function TaskAnalytics() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving]   = useState(false);
  const canvasRef  = useRef(null);
  const metaRef    = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    api.get('/tasks/analytics')
      .then(r => setTasks(r.data))
      .catch(err => { console.error(err); setError('Failed to load analytics.'); })
      .finally(() => setLoading(false));
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tasks.length) return;

    const ctx  = canvas.getContext('2d');
    const wrap = canvas.parentElement;
    const W    = Math.min(wrap?.clientWidth ?? 700, 820);
    const H    = Math.round(W * 0.56);

    canvas.width  = W;
    canvas.height = H;

    const PAD   = { top: 40, right: 40, bottom: 70, left: 90 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top  - PAD.bottom;

    const allVals = tasks.flatMap(t => [toNum(t.estimatedCompletion), toNum(t.completedAt)]);
    const minV    = Math.min(...allVals) - 3;
    const maxV    = Math.max(...allVals) + 3;
    const range   = maxV - minV;

    const toX = v => PAD.left + ((v - minV) / range) * plotW;
    const toY = v => PAD.top  + ((maxV - v) / range) * plotH;

    metaRef.current = { toX, toY, tasks };

    ctx.clearRect(0, 0, W, H);

    const TICKS = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth   = 1;
    ctx.font        = '11px "DM Sans", sans-serif';
    ctx.fillStyle   = '#8a8f9a';

    for (let i = 0; i <= TICKS; i++) {
      const v = minV + (i / TICKS) * range;
      const x = toX(v);
      const y = toY(v);
      const label = fmtDuration(v);

      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillText(label, x, PAD.top + plotH + 20);
      ctx.textAlign = 'right';
      ctx.fillText(label, PAD.left - 10, y + 4);
    }

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#c0c4ce';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(toX(minV), toY(minV));
    ctx.lineTo(toX(maxV), toY(maxV));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#555';
    ctx.font      = '13px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Estimated Time', PAD.left + plotW / 2, H - 14);
    ctx.save();
    ctx.translate(25, PAD.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Actual Time', 0, 0);
    ctx.restore();

    tasks.forEach(t => {
      const x    = toX(toNum(t.estimatedCompletion));
      const y    = toY(toNum(t.completedAt));
      const late = toNum(t.completedAt) > toNum(t.estimatedCompletion);
      const color = late ? '#e05a30' : '#1d9e75';

      const grd = ctx.createRadialGradient(x, y, 0, x, y, 14);
      grd.addColorStop(0, color + '40');
      grd.addColorStop(1, color + '00');
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle   = color; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    });
  }, [tasks]);

  useEffect(() => {
    if (!tasks.length) return;
    drawCanvas();
    const onResize = () => drawCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [tasks, drawCanvas]);

  const handleMouseMove = useCallback(e => {
    const canvas = canvasRef.current;
    const meta   = metaRef.current;
    if (!canvas || !meta) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left)  * scaleX;
    const my = (e.clientY - rect.top)   * scaleY;

    let found = null;
    meta.tasks.forEach(t => {
      const cx = meta.toX(toNum(t.estimatedCompletion));
      const cy = meta.toY(toNum(t.completedAt));
      if (Math.hypot(mx - cx, my - cy) <= 14) found = t;
    });

    if (found) {
      const diff = toNum(found.completedAt) - toNum(found.estimatedCompletion);
      const cssX = (meta.toX(toNum(found.estimatedCompletion)) / scaleX) + 20;
      const cssY = (meta.toY(toNum(found.completedAt))         / scaleY) - 10;
      setTooltip({ task: found, diff, x: cssX, y: cssY });
    } else {
      setTooltip(prev => {
        if (!prev) return null;
        const el = tooltipRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right &&
              e.clientY >= r.top  && e.clientY <= r.bottom) return prev;
        }
        return null;
      });
    }
  }, []);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await api.patch(`/tasks/${editing._id}`, {
        completedAt: editVal || null,
      });
      setTasks(prev => prev.map(t => t._id === editing._id ? res.data : t));
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = t => {
    setEditing(t);
    setEditVal(toInputVal(t.completedAt));
    setTooltip(null);
  };

  const avgDiff = tasks.length
    ? tasks.reduce((s, t) => s + (toNum(t.completedAt) - toNum(t.estimatedCompletion)), 0) / tasks.length
    : 0;
  const lateCount = tasks.filter(t => toNum(t.completedAt) > toNum(t.estimatedCompletion)).length;
  const earlyCount = tasks.length - lateCount;

  if (loading) return (
    <div className="ta-loading">
      <span className="ta-spinner" />
      Loading analytics…
    </div>
  );

  if (error) return <div className="ta-error">{error}</div>;

  return (
    <div className="ta-page">
      <header className="ta-header">
        <h1 className="ta-title">Task Analytics</h1>
        <p className="ta-subtitle">Track how your estimates compare to reality</p>
      </header>

      <div className="ta-stats">
        {[
          { label: 'Tracked Tasks',    value: tasks.length,     mod: ''      },
          { label: 'Completed Late',   value: lateCount,     mod: 'late'  },
          { label: 'Completed Early',  value: earlyCount,    mod: 'early' },
          {
            label: 'Avg Performance',
            value: Math.round(avgDiff) === 0 ? 'On time'
                 : avgDiff  > 0 ? `+${fmtDuration(avgDiff)} late`
                 : `${fmtDuration(avgDiff)} early`,
            mod: avgDiff > 0.5 ? 'late' : avgDiff < -0.5 ? 'early' : '',
          },
        ].map(({ label, value, mod }) => (
          <div key={label} className={`ta-stat ${mod}`}>
            <span className="ta-stat-label">{label}</span>
            <span className="ta-stat-num">{value}</span>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="ta-empty">
          <p>No tracked tasks yet.<br />Set an estimate when creating tasks, then mark them done.</p>
        </div>
      ) : (
        <>
          <div className="ta-legend">
            <span><i className="ta-dot green" /> Early / On time</span>
            <span><i className="ta-dot red"   /> Late</span>
            <span><i className="ta-dash"      /> Perfect estimate</span>
          </div>

          <div className="ta-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="ta-canvas"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(null)}
            />

            {tooltip && (
              <div
                ref={tooltipRef}
                className="ta-tooltip"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <strong>{tooltip.task.text}</strong>
                <span>Est:  {fmtDateTime(tooltip.task.estimatedCompletion)}</span>
                <span>Done: {fmtDateTime(tooltip.task.completedAt)}</span>
                <span className={`tt-perf ${tooltip.diff > 0.1 ? 'late' : 'early'}`}>
                  {Math.round(tooltip.diff) === 0 ? 'On time ✓'
                   : tooltip.diff > 0 ? `+${fmtDuration(tooltip.diff)} late`
                   : `${fmtDuration(tooltip.diff)} early`}
                </span>
                <button className="ta-edit-btn" onClick={() => openEdit(tooltip.task)}>
                  Edit actual time ✏️
                </button>
              </div>
            )}
          </div>

          <section className="completed-tasks-section">
            <h2 className="section-title">Completed Tasks</h2>
            <div className="completed-tasks-grid">
              {tasks.map(t => {
                const diff = toNum(t.completedAt) - toNum(t.estimatedCompletion);
                const mod  = diff > 0.1 ? 'late' : diff < -0.1 ? 'early' : 'ontime';
                return (
                  <div key={t._id} className="completed-task-card">
                    <div className="task-header">
                      <span className="task-name">{t.text}</span>
                      <span className={`performance-badge ${mod}`}>
                        {Math.round(diff) === 0 ? 'On Time ✓' : diff > 0 ? `+${fmtDuration(diff)} Late` : `${fmtDuration(diff)} Early`}
                      </span>
                    </div>
                    <div className="task-details">
                      <div><strong>Estimated:</strong> {fmtDateTime(t.estimatedCompletion)}</div>
                      <div><strong>Completed:</strong> {fmtDateTime(t.completedAt)}</div>
                    </div>
                    <button className="card-edit-btn" onClick={() => openEdit(t)}>
                      Edit Completion Time ✏️
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="inline-edit-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Actual Completion Time</h3>
            <p className="modal-task-name">{editing.text}</p>
            <input
              type="datetime-local"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn save-btn" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}