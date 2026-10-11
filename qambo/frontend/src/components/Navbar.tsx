import React from 'react';
import { Activity, ShieldAlert, Clock, Sun, Moon, Cpu, ExternalLink } from 'lucide-react';
import type { SimulationMetrics } from '../types/simulation';

interface NavbarProps {
  metrics: SimulationMetrics;
  selectedAlgorithmName: string;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ metrics, selectedAlgorithmName, isBackendConnected }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <header className="glass-card" style={{ padding: '14px 24px', marginBottom: '20px', borderRadius: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                QAMBO AI
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>RL DISPATCH</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Deep Q-Learning Emergency Ambulance Relocation & Response Simulator
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Day / Night Shift Epoch */}
          <div className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            {metrics.activeEpoch === 'Day Shift' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#a855f7" />}
            <span>{metrics.activeEpoch}</span>
          </div>

          {/* Simulation Time */}
          <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.04)' }}>
            <Clock size={14} color="var(--accent-cyan)" />
            <span style={{ color: 'var(--text-secondary)' }}>Sim Time:</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#fff' }}>
              Day {Math.floor(metrics.simTime / 1440) + 1}, {formatTime(metrics.simTime)}
            </span>
          </div>

          {/* Active AI Policy */}
          <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.04)' }}>
            <Cpu size={14} color="var(--accent-emerald)" />
            <span style={{ color: 'var(--text-secondary)' }}>Agent:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
              {selectedAlgorithmName.split(' ')[0]}
            </span>
          </div>

          {/* Backend Connection */}
          <div className="badge" style={{
            background: isBackendConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isBackendConnected ? '#34d399' : '#fbbf24',
            border: `1px solid ${isBackendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            padding: '6px 12px',
            fontSize: '0.8rem'
          }}>
            <Activity size={14} />
            <span>{isBackendConnected ? 'FastAPI Connected' : 'Browser Engine Active'}</span>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/ArushGarg/qambo"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}
          >
            <span>GitHub</span>
            <ExternalLink size={13} />
          </a>

        </div>

      </div>
    </header>
  );
};
