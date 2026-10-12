import React from 'react';
import { Play, Pause, RotateCcw, FastForward, PlusCircle, Sliders, CheckCircle } from 'lucide-react';
import { BENCHMARK_ALGORITHMS } from '../simulation/engine';

interface ControlPanelProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  selectedAlgorithm: string;
  onAlgorithmChange: (id: string) => void;
  fleetSize: number;
  onFleetSizeChange: (size: number) => void;
  onSpawnIncident: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onSpeedChange,
  selectedAlgorithm,
  onAlgorithmChange,
  fleetSize,
  onFleetSizeChange,
  onSpawnIncident,
}) => {
  return (
    <div className="glass-card" style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="var(--primary-light)" />
          <span>Operational Control & Model Policy</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        
        {/* Playback Controls */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            SIMULATION RUNTIME
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={onTogglePlay}
              className="btn-primary"
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button onClick={onStep} className="btn-secondary" title="Advance by 1 step">
              <FastForward size={15} />
              <span>Step</span>
            </button>

            <button onClick={onReset} className="btn-secondary" title="Reset Simulation">
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>

            <button onClick={onSpawnIncident} className="btn-secondary">
              <PlusCircle size={15} color="var(--primary-light)" />
              <span>Trigger Call</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate:</span>
            {[1, 2, 5, 10, 20].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`btn-secondary ${speed === s ? 'active' : ''}`}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Policy Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            ACTIVE REINFORCEMENT LEARNING POLICY
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedAlgorithm}
              onChange={(e) => onAlgorithmChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {BENCHMARK_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id} style={{ background: '#0f172a', color: '#fff' }}>
                  {algo.name} {algo.isRecommended ? '[Top Benchmark]' : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '7px' }}>
            <CheckCircle size={12} color="var(--primary-light)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {selectedAlgorithm === 'random'
                ? 'Standard unguided baseline allocation.'
                : 'Deep Q-Network predicts optimal return base from experience buffer.'}
            </span>
          </div>
        </div>

        {/* Fleet Scale Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            SIMULATION SCALE
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { size: 3, label: '3 Units (1 Area)' },
              { size: 6, label: '6 Units (2 Areas)' },
              { size: 9, label: '9 Units (3 Areas)' },
            ].map((scale) => (
              <button
                key={scale.size}
                onClick={() => onFleetSizeChange(scale.size)}
                className={`btn-secondary ${fleetSize === scale.size ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  justifyContent: 'center',
                }}
              >
                {scale.label}
              </button>
            ))}
          </div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '7px' }}>
            Adjusts vehicle fleet size and incident cluster distribution.
          </span>
        </div>

      </div>

    </div>
  );
};
