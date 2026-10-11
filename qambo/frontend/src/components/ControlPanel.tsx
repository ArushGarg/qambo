import React from 'react';
import { Play, Pause, RotateCcw, FastForward, PlusCircle, Sparkles, Sliders } from 'lucide-react';
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
    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <span>Simulation Controls & RL Policy</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Playback Controls */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            SIMULATION PLAYBACK
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onTogglePlay}
              className="btn-primary"
              style={{
                background: isRunning ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: isRunning ? '0 4px 14px rgba(245, 158, 11, 0.4)' : '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              <span>{isRunning ? 'Pause Sim' : 'Start Sim'}</span>
            </button>

            <button onClick={onStep} className="btn-secondary" title="Advance by 1 step">
              <FastForward size={16} />
              <span>Step</span>
            </button>

            <button onClick={onReset} className="btn-secondary" title="Reset Simulation">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>

            <button onClick={onSpawnIncident} className="btn-secondary" style={{ color: 'var(--accent-rose)' }}>
              <PlusCircle size={16} />
              <span>Spawn Call</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speed:</span>
            {[1, 2, 5, 10, 20].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`btn-secondary ${speed === s ? 'badge-cyan' : ''}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: speed === s ? 700 : 500,
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Policy Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            REINFORCEMENT LEARNING ALGORITHM
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedAlgorithm}
              onChange={(e) => onAlgorithmChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {BENCHMARK_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id} style={{ background: '#0f172a', color: '#fff' }}>
                  {algo.name} {algo.isRecommended ? '⭐ (Best Performance)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedAlgorithm === 'random'
                ? 'Baseline policy: chooses dispatch stations at random without neural prediction.'
                : 'Deep Q-Network predicts optimal dispatch point minimizing on-scene travel time.'}
            </span>
          </div>
        </div>

        {/* Fleet Scale Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            OPERATIONAL SCALE
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { size: 3, label: '3 Units (1 Hotspot)' },
              { size: 6, label: '6 Units (2 Hotspots)' },
              { size: 9, label: '9 Units (3 Hotspots)' },
            ].map((scale) => (
              <button
                key={scale.size}
                onClick={() => onFleetSizeChange(scale.size)}
                className={`btn-secondary ${fleetSize === scale.size ? 'badge-purple' : ''}`}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  justifyContent: 'center',
                  fontWeight: fleetSize === scale.size ? 700 : 500,
                }}
              >
                {scale.label}
              </button>
            ))}
          </div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Adjusts ambulance fleet density and incident cluster complexity.
          </span>
        </div>

      </div>

    </div>
  );
};
