import React from 'react';
import { Activity } from 'lucide-react';

interface ResponseChartProps {
  data: number[];
  algorithmName: string;
}

export const ResponseChart: React.FC<ResponseChartProps> = ({ data, algorithmName }) => {
  // Recent 30 points
  const recentData = data.slice(-30);
  const baseline = 30.4;
  const currentAvg = recentData.length > 0
    ? (recentData.reduce((a, b) => a + b, 0) / recentData.length).toFixed(1)
    : '16.8';

  const chartHeight = 120;
  const chartWidth = 500;
  const maxVal = 40;
  const minVal = 10;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return chartHeight - ((clamped - minVal) / (maxVal - minVal)) * chartHeight;
  };

  const getPoints = () => {
    if (recentData.length < 2) return '';
    return recentData
      .map((val, idx) => {
        const x = (idx / (recentData.length - 1)) * chartWidth;
        const y = getY(val);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} color="var(--primary-light)" />
            <span>Rolling Call-to-Arrival Latency</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Last {recentData.length} emergency response times with {algorithmName.split(' ')[0]}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--status-emergency)' }}>
            <span style={{ width: '8px', height: '2px', background: 'var(--status-emergency)' }} />
            <span>Random Baseline (30.4m)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--primary-light)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-light)' }} />
            <span>Current: {currentAvg}m</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', height: `${chartHeight}px`, position: 'relative' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          {/* Baseline horizontal line (30.4m) */}
          <line
            x1="0"
            y1={getY(baseline)}
            x2={chartWidth}
            y2={getY(baseline)}
            stroke="var(--status-emergency)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* AI target line (16.4m) */}
          <line
            x1="0"
            y1={getY(16.4)}
            x2={chartWidth}
            y2={getY(16.4)}
            stroke="var(--status-available)"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.5"
          />

          {/* Response line */}
          {recentData.length > 1 && (
            <>
              {/* Area fill */}
              <polygon
                points={`0,${chartHeight} ${getPoints()} ${chartWidth},${chartHeight}`}
                fill="url(#chartGrad)"
                opacity="0.25"
              />
              {/* Stroke */}
              <polyline
                points={getPoints()}
                fill="none"
                stroke="var(--primary-light)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {recentData.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Awaiting response call data...
          </div>
        )}
      </div>

    </div>
  );
};
