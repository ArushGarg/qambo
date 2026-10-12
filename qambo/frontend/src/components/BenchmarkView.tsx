import React from 'react';
import { Award, TrendingUp, Cpu, CheckCircle } from 'lucide-react';
import { BENCHMARK_ALGORITHMS } from '../simulation/engine';

export const BenchmarkView: React.FC = () => {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--primary-light)" />
            <span>Empirical Algorithmic Benchmark Matrix</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Comparative evaluation of all 10 Deep Q-Network architectures tested across 30 independent simulation runs
          </p>
        </div>
        <span className="badge badge-available">
          <CheckCircle size={13} />
          <span>Independent Test Validated</span>
        </span>
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>ALGORITHM</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>CALL TO ARRIVAL</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>DISPATCH TRANSIT</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>SPEEDUP VS RANDOM</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_ALGORITHMS.map((algo, idx) => (
              <tr
                key={algo.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  background: algo.isRecommended ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                }}
              >
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    <span>{algo.name}</span>
                    {algo.isRecommended && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>SOTA</span>}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                  {algo.category}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="font-mono" style={{ fontWeight: 700, color: algo.callToArrival < 17 ? 'var(--status-available)' : 'var(--text-primary)' }}>
                    {algo.callToArrival.toFixed(1)} min
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {algo.assignToArrival.toFixed(1)} min
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {algo.improvement > 0 ? (
                    <span className="badge badge-available" style={{ fontSize: '0.75rem' }}>
                      <TrendingUp size={12} />
                      +{algo.improvement.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Baseline</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {algo.isRecommended ? (
                    <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.75rem' }}>Optimal (Lowest Variance)</span>
                  ) : algo.improvement > 40 ? (
                    <span style={{ color: 'var(--status-available)', fontSize: '0.75rem' }}>High Performance</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Control Standard</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Bar Comparison */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={16} color="var(--primary-light)" />
          <span>Response Latency Reduction (Lower is Better)</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {BENCHMARK_ALGORITHMS.map((algo) => {
            const percentage = (algo.callToArrival / 32) * 100;
            return (
              <div key={algo.id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 70px', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: algo.isRecommended ? 'var(--primary-light)' : 'var(--text-secondary)', fontWeight: algo.isRecommended ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {algo.name}
                </span>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', height: '8px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: algo.id === 'random' ? 'var(--status-emergency)' : algo.isRecommended ? 'var(--primary)' : 'rgba(148, 163, 184, 0.35)',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span className="font-mono" style={{ fontSize: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                  {algo.callToArrival.toFixed(1)}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
