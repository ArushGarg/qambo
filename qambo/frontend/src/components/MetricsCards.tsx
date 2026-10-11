import React from 'react';
import { Timer, Zap, CheckCircle2, PhoneCall, Truck } from 'lucide-react';
import type { SimulationMetrics, Ambulance } from '../types/simulation';

interface MetricsCardsProps {
  metrics: SimulationMetrics;
  ambulances: Ambulance[];
  activeCallsCount: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, ambulances, activeCallsCount }) => {
  const idleCount = ambulances.filter(a => a.status === 'idle').length;
  const dispatchedCount = ambulances.filter(a => a.status === 'dispatched').length;
  const transportingCount = ambulances.filter(a => a.status === 'transporting').length;
  const returningCount = ambulances.filter(a => a.status === 'returning').length;
  const busyCount = dispatchedCount + transportingCount + returningCount;

  // Improvement calculation against random baseline (30.4m)
  const baseline = 30.4;
  const diffPercent = ((baseline - metrics.avgCallToArrival) / baseline) * 100;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      
      {/* 1. Mean Call to Arrival */}
      <div className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-cyan), #3b82f6)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CALL TO ARRIVAL</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-cyan-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Timer size={18} color="var(--accent-cyan)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {metrics.avgCallToArrival.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
            ↓ {diffPercent.toFixed(1)}% vs Random
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Baseline: 30.4m</span>
        </div>
      </div>

      {/* 2. Mean Assignment to Arrival */}
      <div className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-emerald), #10b981)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DISPATCH TRANSIT</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-emerald-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} color="var(--accent-emerald)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {metrics.avgAssignToArrival.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>High Efficiency</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scene transit time</span>
        </div>
      </div>

      {/* 3. Demand Met */}
      <div className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-purple), #a855f7)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEMAND MET</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-purple-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={18} color="var(--accent-purple)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {metrics.demandMet.toFixed(1)}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Zero Call Starvation</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metrics.resolvedCalls} resolved</span>
        </div>
      </div>

      {/* 4. Active Emergencies */}
      <div className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-rose), #ef4444)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EMERGENCY CALLS</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-rose-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PhoneCall size={18} color="var(--accent-rose)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {activeCallsCount}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
            {metrics.totalCalls} total logged
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Poisson arrival</span>
        </div>
      </div>

      {/* 5. Fleet Status */}
      <div className="glass-card" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-amber), #f59e0b)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FLEET DEPLOYMENT</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-amber-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={18} color="var(--accent-amber)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            {busyCount}/{ambulances.length}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>in action</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
            {idleCount} stationed at base
          </span>
        </div>
      </div>

    </div>
  );
};
