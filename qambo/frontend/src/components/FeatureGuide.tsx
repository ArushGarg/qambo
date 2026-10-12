import React from 'react';
import { CheckCircle2, Layout, Activity, Cpu, MapPin, AlertCircle, Sparkles } from 'lucide-react';

export const FeatureGuide: React.FC = () => {
  const features = [
    {
      title: 'Geographic City Grid (50×50 Amboworld)',
      desc: 'Simulates a 2D metropolitan area with 25 candidate dispatch stations, 3 major trauma hospitals, and arterial expressways.',
      status: 'Implemented & Visualized',
      tag: 'Environment'
    },
    {
      title: 'Dynamic Incident Hotspots (Day/Night Shifts)',
      desc: 'Accident and emergency hotspots shift geographic density between Day Shift and Night Shift, replicating realistic shifting human demand.',
      status: 'Implemented & Visualized',
      tag: 'Simulation'
    },
    {
      title: 'Closest-Ambulance Dispatch Policy',
      desc: 'When an emergency 911 call occurs, Euclidean distance is calculated across all available or relocating units to immediately assign the nearest vehicle.',
      status: 'Implemented & Visualized',
      tag: 'Dispatch'
    },
    {
      title: 'Hospital Conveyance Lifecycle',
      desc: 'Ambulances collect patients from scene coordinates and transport them to the closest receiving hospital center before becoming free for redeployment.',
      status: 'Implemented & Visualized',
      tag: 'Clinical Transit'
    },
    {
      title: 'Deep Q-Learning Base Relocation Agent',
      desc: 'Instead of staying at the hospital or picking at random, the Deep RL agent evaluates all 25 bases and reallocates the ambulance to anticipate future emergency calls.',
      status: 'Implemented & Visualized',
      tag: 'Reinforcement Learning'
    },
    {
      title: 'Quadratic Penalty Reward Function',
      desc: 'Reward is calculated as -(response_time²), which mathematically punishes extreme tail latencies to ensure no patient waits dangerously long.',
      status: 'Implemented & Visualized',
      tag: 'Reward Engineering'
    },
    {
      title: '10 RL Algorithm Variants Tested',
      desc: 'Includes Random Baseline, DDQN, D3QN, Noisy Layers, Prioritized Experience Replay (PER), and 5-Network Bootstrap Bagging Ensembles.',
      status: 'Implemented & Visualized',
      tag: 'Model Architecture'
    },
    {
      title: 'Healthcare KPI Tracking (Call to Arrival)',
      desc: 'Tracks the gold-standard emergency medicine metrics: Call to Arrival, Assignment to Arrival, and 100% Demand Met fraction.',
      status: 'Implemented & Visualized',
      tag: 'Analytics'
    },
  ];

  const uiSections = [
    {
      icon: <Layout size={20} color="var(--accent-cyan)" />,
      name: 'Top Navigation Bar',
      detail: 'Displays live simulation clock (Day & 24hr time), active Day/Night shift badge, current AI model in charge, and the FastAPI Python backend connection status.'
    },
    {
      icon: <Activity size={20} color="var(--accent-emerald)" />,
      name: '5 Top KPI Cards',
      detail: 'Shows Call-to-Arrival time (with % speedup vs Random baseline), Dispatch Transit time, Demand Met rate (100%), Active Calls count, and Fleet Utilization (idle vs busy).'
    },
    {
      icon: <MapPin size={20} color="var(--accent-purple)" />,
      name: 'Tactical City Radar (2D Map)',
      detail: 'Visualizes the 50×50 city with road network, 25 dispatch stations (B1–B25), hospitals (+), pulsing risk hotspots, and animated ambulances with flashing red/blue strobe lights.'
    },
    {
      icon: <Cpu size={20} color="var(--accent-amber)" />,
      name: 'Control Panel',
      detail: 'Allows you to Start/Pause the simulation, step forward, adjust speed (1× to 20×), switch between any of the 10 RL algorithms, and scale the fleet (3, 6, 9 units).'
    },
    {
      icon: <AlertCircle size={20} color="var(--accent-rose)" />,
      name: 'Live Response Chart',
      detail: 'Rolling line graph plotting the response latency of recent calls against the 30.4 min random baseline and 16.4 min AI target.'
    },
    {
      icon: <Sparkles size={20} color="var(--accent-cyan)" />,
      name: 'Live Dispatch & AI Log',
      detail: 'Real-time chronological audit trail of all incidents reported, vehicles dispatched, hospital drop-offs, and neural network relocation choices.'
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
      
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="var(--accent-cyan)" />
          <span>System Architecture & UI Guide</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Complete breakdown of implemented simulation features and how each section of the interface functions
        </p>
      </div>

      {/* 1. Implemented Features Checklist */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="var(--accent-emerald)" />
          <span>Implemented Reinforcement Learning & Simulation Features</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
          {features.map((f, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{f.title}</h4>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{f.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#34d399" />
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>{f.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. UI Section Guide */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layout size={18} color="var(--accent-cyan)" />
          <span>UI Dashboard Component Breakdown (What Each Part Shows)</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
          {uiSections.map((sec, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ marginTop: '2px' }}>{sec.icon}</div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{sec.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{sec.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
