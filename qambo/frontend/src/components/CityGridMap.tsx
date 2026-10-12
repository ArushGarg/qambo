import React, { useRef, useEffect, useState } from 'react';
import type { Ambulance, Incident, Hospital, DispatchBase, Hotspot } from '../types/simulation';
import { MousePointerClick, Layers, Eye, Compass, Radar, Shield } from 'lucide-react';

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
  const [showBaseLabels, setShowBaseLabels] = useState(true);
  const [showRadarSweep, setShowRadarSweep] = useState(true);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const WORLD_SIZE = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let radarAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const scale = width / WORLD_SIZE;
      radarAngle += 0.02;

      // ==========================================
      // 1. BASE TERRAIN & CITY BACKGROUND
      // ==========================================
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle city blocks (grid-based metropolitan texture)
      ctx.fillStyle = '#0a1020';
      const blockSize = 4 * scale;
      const gap = 1 * scale;
      for (let bx = gap; bx < width - gap; bx += blockSize + gap) {
        for (let by = gap; by < height - gap; by += blockSize + gap) {
          ctx.fillRect(bx, by, blockSize, blockSize);
        }
      }

      // Draw River / Waterway across the city (aesthetic geographic feature)
      ctx.beginPath();
      ctx.moveTo(0, height * 0.42);
      ctx.bezierCurveTo(
        width * 0.35, height * 0.38,
        width * 0.65, height * 0.52,
        width, height * 0.48
      );
      ctx.lineTo(width, height * 0.54);
      ctx.bezierCurveTo(
        width * 0.65, height * 0.58,
        width * 0.35, height * 0.44,
        0, height * 0.48
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ==========================================
      // 2. MAJOR ARTERIAL HIGHWAYS & ROAD NETWORK
      // ==========================================
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.lineWidth = 6;
      // Main horizontal & vertical expressways
      const expressways = [10, 20, 30, 40];
      expressways.forEach((pos) => {
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, pos * scale);
        ctx.lineTo(width, pos * scale);
        ctx.stroke();

        // Vertical
        ctx.beginPath();
        ctx.moveTo(pos * scale, 0);
        ctx.lineTo(pos * scale, height);
        ctx.stroke();
      });

      // Neon road lane center dashes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      expressways.forEach((pos) => {
        ctx.beginPath();
        ctx.moveTo(0, pos * scale);
        ctx.lineTo(width, pos * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pos * scale, 0);
        ctx.lineTo(pos * scale, height);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Sector Zone Typography Overlay
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.textAlign = 'left';
      ctx.fillText('SECTOR 1 [NORTH INDUSTRIAL]', 14, 22);
      ctx.fillText('SECTOR 2 [METRO CORE]', width * 0.52, 22);
      ctx.fillText('SECTOR 3 [DOWNTOWN SOUTH]', 14, height - 16);
      ctx.fillText('SECTOR 4 [TECH EXP-WAY]', width * 0.52, height - 16);

      // ==========================================
      // 3. SHIFTING RISK HOTSPOTS (DAY/NIGHT RISK)
      // ==========================================
      if (showHotspots) {
        hotspots.forEach((spot) => {
          const cx = spot.x * scale;
          const cy = spot.y * scale;
          const r = spot.radius * scale;

          // Multi-layer glowing heat halo
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
          grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
          grad.addColorStop(0.85, 'rgba(244, 63, 94, 0.04)');
          grad.addColorStop(1, 'rgba(244, 63, 94, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // Dotted hazard border
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Hotspot Center Label
          ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#f87171';
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ ${spot.name}`, cx, cy - r - 4);
        });
      }

      // ==========================================
      // 4. RADAR SWEEP SCANNER BEAM
      // ==========================================
      if (showRadarSweep) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = width * 0.72;

        const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, radarAngle - 0.35, radarAngle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        // Leading bright scanner line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(radarAngle) * radius, cy + Math.sin(radarAngle) * radius);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // ==========================================
      // 5. TRAJECTORY PATHS WITH VEHICLE TRAILS
      // ==========================================
      if (showPaths) {
        ambulances.forEach((ambo) => {
          if (ambo.targetX !== undefined && ambo.targetY !== undefined) {
            const startX = ambo.x * scale;
            const startY = ambo.y * scale;
            const targetX = ambo.targetX * scale;
            const targetY = ambo.targetY * scale;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(targetX, targetY);

            if (ambo.status === 'dispatched') {
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)'; // Amber path to scene
            } else if (ambo.status === 'transporting') {
              ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)'; // Purple path to hospital
            } else {
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)'; // Cyan path to base
            }

            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // ==========================================
      // 6. 25 STRATEGIC DISPATCH BASES (STATIONS)
      // ==========================================
      dispatchBases.forEach((base) => {
        const bx = base.x * scale;
        const by = base.y * scale;
        const hasAmbo = base.ambulancesPresent > 0;

        // Base Pod Exterior
        ctx.fillStyle = hasAmbo ? 'rgba(6, 182, 212, 0.22)' : 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = hasAmbo ? '#06b6d4' : 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = hasAmbo ? 2 : 1;

        ctx.beginPath();
        ctx.roundRect(bx - 12, by - 12, 24, 24, 6);
        ctx.fill();
        ctx.stroke();

        // Pulsing base beacon if units are parked
        if (hasAmbo) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, 16 + Math.sin(Date.now() / 250) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Base Number & Unit Count
        if (showBaseLabels) {
          ctx.font = '700 8px "JetBrains Mono", monospace';
          ctx.fillStyle = hasAmbo ? '#38bdf8' : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`B${base.id + 1}`, bx, by - (hasAmbo ? 2 : 0));

          if (hasAmbo) {
            ctx.font = '600 7px "JetBrains Mono", monospace';
            ctx.fillStyle = '#34d399';
            ctx.fillText(`• ${base.ambulancesPresent} •`, bx, by + 6);
          }
        }
      });

      // ==========================================
      // 7. HOSPITALS (EMERGENCY TRAUMA CENTERS)
      // ==========================================
      hospitals.forEach((hosp) => {
        const hx = hosp.x * scale;
        const hy = hosp.y * scale;

        // Glowing outer green perimeter
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.beginPath();
        ctx.arc(hx, hy, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Emerald compound pad
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.roundRect(hx - 11, hy - 11, 22, 22, 5);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.stroke();

        // Bold Medical White Cross
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 2.5, hy - 7, 5, 14);
        ctx.fillRect(hx - 7, hy - 2.5, 14, 5);

        // Facility Name Banner
        ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText(hosp.name, hx, hy + 26);
      });

      // ==========================================
      // 8. ACTIVE EMERGENCY INCIDENTS (CRITICAL BEACONS)
      // ==========================================
      const now = Date.now();
      incidents.forEach((inc) => {
        if (inc.status === 'resolved') return;
        const ix = inc.x * scale;
        const iy = inc.y * scale;

        // Expanding triple shockwave rings
        const wave1 = (now / 20) % 24;
        const wave2 = (now / 20 + 8) % 24;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ix, iy, wave1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(ix, iy, wave2, 0, Math.PI * 2);
        ctx.stroke();

        // Emergency Core Beacon
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ix, iy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulsing exclamation mark
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', ix, iy);

        // Call Tag
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(`911 CALL #${inc.id}`, ix, iy - 14);
      });

      // ==========================================
      // 9. ANIMATED AMBULANCES (SPRINTER VEHICLES)
      // ==========================================
      ambulances.forEach((ambo) => {
        const ax = ambo.x * scale;
        const ay = ambo.y * scale;

        let statusColor = '#10b981'; // idle green
        let statusText = 'IDLE';
        if (ambo.status === 'dispatched') {
          statusColor = '#f59e0b';
          statusText = 'ON ROUTE';
        } else if (ambo.status === 'transporting') {
          statusColor = '#a855f7';
          statusText = 'HOSPITAL';
        } else if (ambo.status === 'returning') {
          statusColor = '#06b6d4';
          statusText = 'REPOSITION';
        }

        // Calculate heading angle
        let angle = 0;
        if (ambo.targetX !== undefined && ambo.targetY !== undefined) {
          angle = Math.atan2(ambo.targetY * scale - ay, ambo.targetX * scale - ax);
        }

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);

        // Vehicle Chassis (Length: 20px, Width: 12px)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 12, 3);
        ctx.fill();
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(4, -4, 4, 8);

        // Dual Flashing Siren Strobes (alternating Red / Blue)
        const strobeState = Math.floor(now / 150) % 2 === 0;
        if (ambo.status !== 'idle') {
          ctx.fillStyle = strobeState ? '#ef4444' : '#3b82f6';
          ctx.beginPath();
          ctx.arc(-1, -3, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = strobeState ? '#3b82f6' : '#ef4444';
          ctx.beginPath();
          ctx.arc(-1, 3, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Vehicle ID & Status Badge floating near vehicle
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`AMBO #${ambo.id}`, ax, ay - 14);

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = statusColor;
        ctx.fillText(statusText, ax, ay + 16);
      });

      // ==========================================
      // 10. TACTICAL HUD CORNERS & CROSSHAIRS
      // ==========================================
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      const corner = 18;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(8, 8 + corner);
      ctx.lineTo(8, 8);
      ctx.lineTo(8 + corner, 8);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - 8 - corner, 8);
      ctx.lineTo(width - 8, 8);
      ctx.lineTo(width - 8, 8 + corner);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(8, height - 8 - corner);
      ctx.lineTo(8, height - 8);
      ctx.lineTo(8 + corner, height - 8);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - 8 - corner, height - 8);
      ctx.lineTo(width - 8, height - 8);
      ctx.lineTo(width - 8, height - 8 - corner);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ambulances, dispatchBases, hospitals, hotspots, incidents, showHotspots, showPaths, showBaseLabels, showRadarSweep]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / WORLD_SIZE;
    const x = Number(((e.clientX - rect.left) / scale).toFixed(1));
    const y = Number(((e.clientY - rect.top) / scale).toFixed(1));
    setHoverCoord({ x, y });
  };

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: '18px', position: 'relative' }}>
      
      {/* Header with tactical radar styling */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radar size={20} color="var(--accent-cyan)" />
              <span>Tactical Operations Radar</span>
            </h2>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>50×50 METRO TWIN</span>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>LIVE 60 FPS</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Full digital-twin city map with arterial expressways, shifting risk clusters, and vehicle telemetry
          </p>
        </div>

        {/* Tactical Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`btn-secondary ${showRadarSweep ? 'badge-cyan' : ''}`}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            <Compass size={13} />
            <span>Radar Sweep</span>
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`btn-secondary ${showHotspots ? 'badge-rose' : ''}`}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            <Layers size={13} />
            <span>Risk Hotspots</span>
          </button>

          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`btn-secondary ${showPaths ? 'badge-purple' : ''}`}
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            <Eye size={13} />
            <span>Trajectories</span>
          </button>

          <button
            onClick={() => setShowBaseLabels(!showBaseLabels)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
          >
            <Shield size={13} />
            <span>Stations</span>
          </button>
        </div>
      </div>

      {/* Canvas Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        maxHeight: '620px',
        margin: '0 auto',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(6, 182, 212, 0.08)'
      }}>
        <canvas
          ref={canvasRef}
          width={700}
          height={700}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />

        {/* GPS Coordinates HUD */}
        {hoverCoord && (
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'rgba(10, 15, 30, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>GPS: [{hoverCoord.x}, {hoverCoord.y}]</span>
          </div>
        )}

        {/* Click to spawn interactive banner */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '7px 14px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <MousePointerClick size={14} color="var(--accent-cyan)" />
          <span>Click anywhere to dispatch an emergency call to coordinates</span>
        </div>
      </div>

      {/* Enhanced Legend Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '8px', background: '#ffffff', border: '1px solid #10b981', borderRadius: '2px', display: 'inline-block' }} />
          <span>Ambulance (Stationed)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
          <span>Responding to Scene</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <span>Conveying to Hospital</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
          <span>AI Repositioning</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
          <span>911 Emergency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>+</span>
          <span>Trauma Center</span>
        </div>
      </div>

    </div>
  );
};
