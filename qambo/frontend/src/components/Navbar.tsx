import React from 'react';
import { Activity, ShieldCheck, Clock, Sun, Moon, Cpu, ExternalLink } from 'lucide-react';
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
    <header className="glass-card" style={{ padding: '14px 22px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
          }}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                QAMBO
              </h1>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>OPERATIONS</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Emergency Ambulance Dispatch & Relocation Platform
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Day / Night Shift Epoch */}
          <div className="badge badge-neutral" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
            {metrics.activeEpoch === 'Day Shift' ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color="#60a5fa" />}
            <span>{metrics.activeEpoch}</span>
          </div>

          {/* Simulation Time */}
          <div className="badge badge-neutral" style={{ padding: '5px 10px', fontSize: '0.78rem', gap: '6px' }}>
            <Clock size={13} color="var(--primary-light)" />
            <span style={{ color: 'var(--text-secondary)' }}>Time:</span>
            <span className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>
              Day {Math.floor(metrics.simTime / 1440) + 1}, {formatTime(metrics.simTime)}
            </span>
          </div>

          {/* Active AI Policy */}
          <div className="badge badge-primary" style={{ padding: '5px 10px', fontSize: '0.78rem', gap: '6px' }}>
            <Cpu size={13} />
            <span>Agent: {selectedAlgorithmName.split(' ')[0]}</span>
          </div>

          {/* Backend Connection */}
          <div className={`badge ${isBackendConnected ? 'badge-available' : 'badge-transit'}`} style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
            <Activity size={13} />
            <span>{isBackendConnected ? 'API Connected' : 'Engine Ready'}</span>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/ArushGarg/qambo"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', textDecoration: 'none' }}
          >
            <span>Repository</span>
            <ExternalLink size={12} />
          </a>

        </div>

      </div>
    </header>
  );
};
