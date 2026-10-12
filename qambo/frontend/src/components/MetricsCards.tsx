import React from 'react';
import { Timer, Zap, CheckCircle2, PhoneCall, Truck, TrendingDown } from 'lucide-react';
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '14px',
      marginBottom: '18px'
    }}>
      
      {/* 1. Mean Call to Arrival */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--primary)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            CALL TO ARRIVAL
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Timer size={15} color="var(--primary-light)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {metrics.avgCallToArrival.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
            <TrendingDown size={11} />
            {diffPercent.toFixed(1)}% vs baseline
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: 16.4m</span>
        </div>
      </div>

      {/* 2. Mean Assignment to Arrival */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--primary-light)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            TRANSIT TIME
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={15} color="var(--primary-light)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {metrics.avgAssignToArrival.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            On-scene dispatch
          </span>
        </div>
      </div>

      {/* 3. Demand Met */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--status-available)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            DEMAND MET
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-available-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={15} color="var(--status-available)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {metrics.demandMet.toFixed(1)}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
            {metrics.resolvedCalls} resolved
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 dropped</span>
        </div>
      </div>

      {/* 4. Active Emergencies */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--status-emergency)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            ACTIVE CALLS
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-emergency-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PhoneCall size={15} color="var(--status-emergency)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {activeCallsCount}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {metrics.totalCalls} total logged
          </span>
        </div>
      </div>

      {/* 5. Fleet Status */}
      <div className="glass-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--status-transit)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            FLEET IN ACTION
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-transit-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={15} color="var(--status-transit)" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {busyCount}/{ambulances.length}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>deployed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            {idleCount} stationed at base
          </span>
        </div>
      </div>

    </div>
  );
};
