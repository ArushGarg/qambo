import React, { useState } from 'react';
import { Terminal, AlertTriangle, Truck, Hospital, Navigation } from 'lucide-react';
import type { DispatchLogItem } from '../types/simulation';

interface EventLogProps {
  logs: DispatchLogItem[];
}

export const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'alert' | 'dispatch' | 'reposition'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getIcon = (type: DispatchLogItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={15} color="var(--accent-rose)" />;
      case 'dispatch':
        return <Truck size={15} color="var(--accent-amber)" />;
      case 'hospital':
        return <Hospital size={15} color="var(--accent-purple)" />;
      case 'reposition':
        return <Navigation size={15} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '580px' }}>
      
      {/* Header & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={17} color="var(--accent-emerald)" />
          <span>Live Dispatch & AI Log</span>
        </h2>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'alert', 'dispatch', 'reposition'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-secondary ${filter === f ? 'badge-cyan' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.7rem', textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Awaiting simulation events...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(log.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{log.title}</span>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {log.simTime}m
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                  {log.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
