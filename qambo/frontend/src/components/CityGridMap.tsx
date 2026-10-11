import React, { useRef, useEffect, useState } from 'react';
import type { Ambulance, Incident, Hospital, DispatchBase, Hotspot } from '../types/simulation';
import { MousePointerClick, Layers, Eye } from 'lucide-react';

interface CityGridMapProps {
  ambulances: Ambulance[];
  dispatchBases: DispatchBase[];
  hospitals: Hospital[];
  hotspots: Hotspot[];
  incidents: Incident[];
  onMapClick: (x: number, y: number) => void;
}

export const CityGridMap: React.FC<CityGridMapProps> = ({
  ambulances,
  dispatchBases,
  hospitals,
  hotspots,
  incidents,
  onMapClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showBaseIds, setShowBaseIds] = useState(true);

  const WORLD_SIZE = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const scale = width / WORLD_SIZE;

      // 1. Clear background
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridInterval = 5;
      for (let i = 0; i <= WORLD_SIZE; i += gridInterval) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(width, i * scale);
        ctx.stroke();
      }

      // 3. Draw Hotspots / Incident Clusters (Shifting risk zones)
      if (showHotspots) {
        hotspots.forEach((spot) => {
          const cx = spot.x * scale;
          const cy = spot.y * scale;
          const r = spot.radius * scale;

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          grad.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
          grad.addColorStop(0.6, 'rgba(244, 63, 94, 0.08)');
          grad.addColorStop(1, 'rgba(244, 63, 94, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Dotted perimeter
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // 4. Draw Trajectory Path Lines
      if (showPaths) {
        ambulances.forEach((ambo) => {
          if (ambo.targetX !== undefined && ambo.targetY !== undefined) {
            ctx.beginPath();
            ctx.moveTo(ambo.x * scale, ambo.y * scale);
            ctx.lineTo(ambo.targetX * scale, ambo.targetY * scale);

            if (ambo.status === 'dispatched') {
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'; // Amber path to incident
            } else if (ambo.status === 'transporting') {
              ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'; // Purple path to hospital
            } else {
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'; // Cyan path returning to AI base
            }

            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // 5. Draw 25 Dispatch Bases
      dispatchBases.forEach((base) => {
        const bx = base.x * scale;
        const by = base.y * scale;
        const hasAmbo = base.ambulancesPresent > 0;

        ctx.fillStyle = hasAmbo ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = hasAmbo ? '#06b6d4' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = hasAmbo ? 2 : 1;

        ctx.beginPath();
        ctx.roundRect(bx - 10, by - 10, 20, 20, 4);
        ctx.fill();
        ctx.stroke();

        if (showBaseIds) {
          ctx.fillStyle = hasAmbo ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`B${base.id + 1}`, bx, by);
        }
      });

      // 6. Draw Hospitals
      hospitals.forEach((hosp) => {
        const hx = hosp.x * scale;
        const hy = hosp.y * scale;

        // Glow ring
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.arc(hx, hy, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(hx, hy, 10, 0, Math.PI * 2);
        ctx.fill();

        // White cross
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 2, hy - 6, 4, 12);
        ctx.fillRect(hx - 6, hy - 2, 12, 4);

        // Label
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText(hosp.name.split(' ')[0], hx, hy + 22);
      });

      // 7. Draw Active Incidents
      const now = Date.now();
      incidents.forEach((inc) => {
        if (inc.status === 'resolved') return;
        const ix = inc.x * scale;
        const iy = inc.y * scale;

        // Pulsing alert ring
        const pulse = 10 + (Math.sin(now / 200) + 1) * 6;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ix, iy, pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner beacon
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ix, iy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(`Call #${inc.id}`, ix, iy - 10);
      });

      // 8. Draw Ambulances
      ambulances.forEach((ambo) => {
        const ax = ambo.x * scale;
        const ay = ambo.y * scale;

        let color = '#10b981'; // idle
        if (ambo.status === 'dispatched') color = '#f59e0b';
        if (ambo.status === 'transporting') color = '#a855f7';
        if (ambo.status === 'returning') color = '#06b6d4';

        // Glow aura
        ctx.fillStyle = color + '33';
        ctx.beginPath();
        ctx.arc(ax, ay, 12, 0, Math.PI * 2);
        ctx.fill();

        // Core marker
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ax, ay, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ambulance ID
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${ambo.id}`, ax, ay);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ambulances, dispatchBases, hospitals, hotspots, incidents, showHotspots, showPaths, showBaseIds]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const scale = canvas.width / WORLD_SIZE;
    const worldX = clickX / scale;
    const worldY = clickY / scale;
    onMapClick(worldX, worldY);
  };

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', position: 'relative' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Amboworld 2D Radar</span>
            <span className="badge badge-cyan">50×50 City Grid</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time ambulance fleet tracking, hospital routes, and AI-predicted incident hotspots
          </p>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`btn-secondary ${showHotspots ? 'badge-rose' : ''}`}
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            <Layers size={13} />
            <span>Hotspots</span>
          </button>

          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`btn-secondary ${showPaths ? 'badge-cyan' : ''}`}
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            <Eye size={13} />
            <span>Path Lines</span>
          </button>

          <button
            onClick={() => setShowBaseIds(!showBaseIds)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            <span>Base IDs</span>
          </button>
        </div>
      </div>

      {/* Canvas Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        maxHeight: '560px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.7)'
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />

        {/* Click to spawn notice */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          <MousePointerClick size={14} color="var(--accent-cyan)" />
          <span>Click anywhere to simulate an emergency call</span>
        </div>
      </div>

      {/* Legend Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginTop: '16px',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          <span>Stationed (Idle)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Dispatched to Scene</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7' }} />
          <span>En Route to Hospital</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }} />
          <span>AI Repositioning to Base</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Active Emergency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</span>
          <span>Hospital Center</span>
        </div>
      </div>

    </div>
  );
};
