import React, { useRef, useEffect, useState } from 'react';
import type { Ambulance, Incident, Hospital, DispatchBase, Hotspot } from '../types/simulation';
import { MousePointerClick, Layers, Eye, Compass, Shield, MapPin, Truck, Plus } from 'lucide-react';

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
      radarAngle += 0.018;

      // ==========================================
      // 1. BASE CANVASES & URBAN BLOCKS
      // ==========================================
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, width, height);

      // Shaded urban city blocks (clean architectural texture)
      ctx.fillStyle = '#0f172a';
      const blockSize = 4 * scale;
      const gap = 1 * scale;
      for (let bx = gap; bx < width - gap; bx += blockSize + gap) {
        for (let by = gap; by < height - gap; by += blockSize + gap) {
          ctx.fillRect(bx, by, blockSize, blockSize);
        }
      }

      // Waterway cutting through sector
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
      ctx.fillStyle = 'rgba(37, 99, 235, 0.07)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ==========================================
      // 2. ARTERIAL HIGHWAYS & ROAD NETWORK
      // ==========================================
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      const expressways = [10, 20, 30, 40];
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

      // Subtle dashed road markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
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

      // Sector Zone Labels
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.textAlign = 'left';
      ctx.fillText('SECTOR 1 [NORTH DISTRICT]', 16, 20);
      ctx.fillText('SECTOR 2 [METRO CORE]', width * 0.52, 20);
      ctx.fillText('SECTOR 3 [SOUTHERN BASIN]', 16, height - 14);
      ctx.fillText('SECTOR 4 [EAST ARTERY]', width * 0.52, height - 14);

      // ==========================================
      // 3. RISK HOTSPOTS (SHIFTING CLUSTERS)
      // ==========================================
      if (showHotspots) {
        hotspots.forEach((spot) => {
          const cx = spot.x * scale;
          const cy = spot.y * scale;
          const r = spot.radius * scale;

          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
          grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.08)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = 'rgba(248, 113, 113, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(`INCIDENT ZONE: ${spot.name.toUpperCase()}`, cx, cy - r - 4);
        });
      }

      // ==========================================
      // 4. RADAR SWEEP SCANNER
      // ==========================================
      if (showRadarSweep) {
        const cx = width / 2;
        const cy = height / 2;
        const radius = width * 0.72;

        const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        sweepGrad.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
        sweepGrad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, radarAngle - 0.32, radarAngle);
        ctx.closePath();
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(radarAngle) * radius, cy + Math.sin(radarAngle) * radius);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // ==========================================
      // 5. TRAJECTORY PATH LINES
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
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            } else if (ambo.status === 'transporting') {
              ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
            } else {
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
            }

            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      }

      // ==========================================
      // 6. 25 DISPATCH BASES
      // ==========================================
      dispatchBases.forEach((base) => {
        const bx = base.x * scale;
        const by = base.y * scale;
        const hasAmbo = base.ambulancesPresent > 0;

        ctx.fillStyle = hasAmbo ? 'rgba(37, 99, 235, 0.22)' : 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = hasAmbo ? '#3b82f6' : 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = hasAmbo ? 1.8 : 1;

        ctx.beginPath();
        ctx.roundRect(bx - 11, by - 11, 22, 22, 4);
        ctx.fill();
        ctx.stroke();

        if (showBaseLabels) {
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillStyle = hasAmbo ? '#93c5fd' : '#64748b';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`B${base.id + 1}`, bx, by - (hasAmbo ? 2 : 0));

          if (hasAmbo) {
            ctx.font = '600 7px "JetBrains Mono", monospace';
            ctx.fillStyle = '#34d399';
            ctx.fillText(`${base.ambulancesPresent}`, bx, by + 5);
          }
        }
      });

      // ==========================================
      // 7. HOSPITALS (TRAUMA CENTERS)
      // ==========================================
      hospitals.forEach((hosp) => {
        const hx = hosp.x * scale;
        const hy = hosp.y * scale;

        // Outer perimeter ring
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.beginPath();
        ctx.arc(hx, hy, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(hx, hy, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Facility base pad
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.roundRect(hx - 10, hy - 10, 20, 20, 4);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.stroke();

        // White Cross
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - 2, hy - 6, 4, 12);
        ctx.fillRect(hx - 6, hy - 2, 12, 4);

        // Name
        ctx.font = '600 8px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText(hosp.name, hx, hy + 24);
      });

      // ==========================================
      // 8. ACTIVE EMERGENCY INCIDENTS
      // ==========================================
      const now = Date.now();
      incidents.forEach((inc) => {
        if (inc.status === 'resolved') return;
        const ix = inc.x * scale;
        const iy = inc.y * scale;

        // Double pulse ring
        const wave1 = (now / 22) % 22;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ix, iy, wave1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ix, iy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'center';
        ctx.fillText(`CALL #${inc.id}`, ix, iy - 12);
      });

      // ==========================================
      // 9. AMBULANCE FLEET VEHICLES
      // ==========================================
      ambulances.forEach((ambo) => {
        const ax = ambo.x * scale;
        const ay = ambo.y * scale;

        let statusColor = '#10b981'; // idle
        let statusText = 'AVAILABLE';
        if (ambo.status === 'dispatched') {
          statusColor = '#f59e0b';
          statusText = 'RESPONDING';
        } else if (ambo.status === 'transporting') {
          statusColor = '#3b82f6';
          statusText = 'HOSPITAL';
        } else if (ambo.status === 'returning') {
          statusColor = '#10b981';
          statusText = 'REPOSITIONING';
        }

        let angle = 0;
        if (ambo.targetX !== undefined && ambo.targetY !== undefined) {
          angle = Math.atan2(ambo.targetY * scale - ay, ambo.targetX * scale - ax);
        }

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle);

        // Vehicle Chassis
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-9, -5, 18, 10, 2);
        ctx.fill();
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(3, -3, 3, 6);

        // Emergency Strobes
        if (ambo.status !== 'idle') {
          const strobe = Math.floor(now / 160) % 2 === 0;
          ctx.fillStyle = strobe ? '#ef4444' : '#2563eb';
          ctx.beginPath();
          ctx.arc(-1, -2.5, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = strobe ? '#2563eb' : '#ef4444';
          ctx.beginPath();
          ctx.arc(-1, 2.5, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Floating Tag
        ctx.font = '700 8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`UNIT ${ambo.id}`, ax, ay - 12);

        ctx.font = '600 7px "JetBrains Mono", monospace';
        ctx.fillStyle = statusColor;
        ctx.fillText(statusText, ax, ay + 14);
      });

      // ==========================================
      // 10. TACTICAL HUD RETICLE CORNERS
      // ==========================================
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 1.5;
      const corner = 14;
      ctx.beginPath();
      ctx.moveTo(8, 8 + corner);
      ctx.lineTo(8, 8);
      ctx.lineTo(8 + corner, 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width - 8 - corner, 8);
      ctx.lineTo(width - 8, 8);
      ctx.lineTo(width - 8, 8 + corner);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, height - 8 - corner);
      ctx.lineTo(8, height - 8);
      ctx.lineTo(8 + corner, height - 8);
      ctx.stroke();

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
    <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={17} color="var(--primary-light)" />
              <span>Metropolitan Operations Grid</span>
            </h2>
            <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>50x50 MATRIX</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Live spatial telemetry for ambulance positioning, dispatch stations, and hospital centers
          </p>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`btn-secondary ${showRadarSweep ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
          >
            <Compass size={12} />
            <span>Radar</span>
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`btn-secondary ${showHotspots ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
          >
            <Layers size={12} />
            <span>Risk Zones</span>
          </button>

          <button
            onClick={() => setShowPaths(!showPaths)}
            className={`btn-secondary ${showPaths ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
          >
            <Eye size={12} />
            <span>Routes</span>
          </button>

          <button
            onClick={() => setShowBaseLabels(!showBaseLabels)}
            className={`btn-secondary ${showBaseLabels ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '5px 9px' }}
          >
            <Shield size={12} />
            <span>Stations</span>
          </button>
        </div>
      </div>

      {/* Canvas Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        maxHeight: '580px',
        margin: '0 auto',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
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
            top: '12px',
            left: '12px',
            background: 'rgba(10, 14, 23, 0.9)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <MapPin size={11} />
            <span>POS: [{hoverCoord.x}, {hoverCoord.y}]</span>
          </div>
        )}

        {/* Interactive Notice */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(10, 14, 23, 0.9)',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid var(--border-subtle)'
        }}>
          <MousePointerClick size={12} color="var(--primary-light)" />
          <span>Click grid location to dispatch emergency incident</span>
        </div>
      </div>

      {/* Professional Legend Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '14px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.72rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={13} color="#10b981" />
          <span>Available at Base</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={13} color="#f59e0b" />
          <span>Responding to Scene</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={13} color="#3b82f6" />
          <span>Hospital Conveyance</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={13} color="#3b82f6" />
          <span>Dispatch Station (B1-B25)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={13} color="#10b981" />
          <span>Trauma Center</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Emergency Incident</span>
        </div>
      </div>

    </div>
  );
};
