import { useState } from 'react';
import './Progress.css';

export default function Progress() {
  const [viewMode, setViewMode] = useState('week');

  const data = {
    week: {
      items: ['Mon', 'Tue', 'Wed'],
      series1: [4, 12, 8],
      series2: [6, 14, 10],
      highest: 14,
      todayHours: 5.5,
    },
    month: {
      items: ['Wk 1', 'Wk 2', 'Wk 3'],
      series1: [18, 35, 28],
      series2: [22, 42, 38],
      highest: 42,
      todayHours: 5.5,
    },
    year: {
      items: ['Jan', 'Feb', 'Mar'],
      series1: [120, 180, 150],
      series2: [140, 210, 190],
      highest: 210,
      todayHours: 5.5,
    },
  };

  const current = data[viewMode];
  const maxValue = Math.max(...current.series1, ...current.series2, 1);

  return (
    <div className="progress-wrapper">
      <h1>my track</h1>

      <div className="view-selector">
        {['week', 'month', 'year'].map((mode) => (
          <button
            key={mode}
            className={viewMode === mode ? 'active' : ''}
            onClick={() => setViewMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="progress-content">
        <div className="chart-area">
          <div className="chart-header">
            <span className="series-label">
              <span className="dot series1"></span> Series 1
            </span>
            <span className="series-label">
              <span className="dot series2"></span> Series 2
            </span>
          </div>

          <div className="bars-container">
            {current.items.map((item, index) => {
              const val1 = current.series1[index];
              const val2 = current.series2[index];
              const height1 = (val1 / maxValue) * 100;
              const height2 = (val2 / maxValue) * 100;
              const isHighest = Math.max(val1, val2) === current.highest;

              return (
                <div key={`${viewMode}-${item}`} className="bar-group">
                  <div className="bar-wrapper">
                    <div
                      className="bar series1"
                      style={{ height: `${height1}%` }}
                      title={`Series 1: ${val1}`}
                    ></div>
                    <div
                      className="bar series2"
                      style={{ height: `${height2}%` }}
                      title={`Series 2: ${val2}`}
                    ></div>
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
              <span className="value">{current.highest}</span>
              <span className="label">highest record till today</span>
            </div>
          </div>

          <div className="stat-circle today">
            <div className="circle-content">
              <span className="value">{current.todayHours}</span>
              <span className="label">no of hours studied today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}