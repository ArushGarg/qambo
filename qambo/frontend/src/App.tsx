import React, { useState, useEffect, useRef } from 'react';
import { SimulationEngine, BENCHMARK_ALGORITHMS } from './simulation/engine';
import { Navbar } from './components/Navbar';
import { MetricsCards } from './components/MetricsCards';
import { CityGridMap } from './components/CityGridMap';
import { ControlPanel } from './components/ControlPanel';
import { BenchmarkView } from './components/BenchmarkView';
import { EventLog } from './components/EventLog';
import { ResponseChart } from './components/ResponseChart';
import { Map, BarChart3, Info } from 'lucide-react';

export const App: React.FC = () => {
  const engineRef = useRef<SimulationEngine>(new SimulationEngine());
  const engine = engineRef.current;

  // React state mirrors
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'map' | 'benchmarks'>('map');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Check Python backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/health');
        if (res.ok) setIsBackendConnected(true);
      } catch {
        setIsBackendConnected(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Set up engine update listener
  useEffect(() => {
    engine.setUpdateCallback(() => {
      setTick((t) => t + 1);
    });
  }, [engine]);

  // Simulation step loop
  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let animationId: number;

    const loop = (time: number) => {
      const deltaSec = (time - lastTime) / 1000;
      lastTime = time;

      // dt in simulation minutes: 1 real second = speed * 1.5 sim minutes
      const dt = deltaSec * speed * 1.5;
      engine.step(dt);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRunning, speed, engine]);

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    engine.step(2.0); // advance 2 sim minutes
  };

  const handleReset = () => {
    engine.initWorld();
    setTick((t) => t + 1);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleAlgorithmChange = (algoId: string) => {
    engine.setAlgorithm(algoId);
    setTick((t) => t + 1);
  };

  const handleFleetSizeChange = (newSize: number) => {
    engine.setFleetSize(newSize);
    setTick((t) => t + 1);
  };

  const handleSpawnIncident = () => {
    engine.spawnIncident();
    setTick((t) => t + 1);
  };

  const handleMapClick = (x: number, y: number) => {
    engine.spawnIncident(x, y);
    setTick((t) => t + 1);
  };

  const metrics = engine.getMetrics();
  const currentAlgorithm = BENCHMARK_ALGORITHMS.find((a) => a.id === engine.selectedAlgorithmId) || BENCHMARK_ALGORITHMS[0];
  const activeEmergenciesCount = engine.incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh' }}>
      
      {/* 1. Header Navigation */}
      <Navbar
        metrics={metrics}
        selectedAlgorithmName={currentAlgorithm.name}
        isBackendConnected={isBackendConnected}
      />

      {/* 2. Top KPI Cards */}
      <MetricsCards
        metrics={metrics}
        ambulances={engine.ambulances}
        activeCallsCount={activeEmergenciesCount}
      />

      {/* 3. Controls & Algorithm Selector */}
      <ControlPanel
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onReset={handleReset}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        selectedAlgorithm={engine.selectedAlgorithmId}
        onAlgorithmChange={handleAlgorithmChange}
        fleetSize={engine.fleetSize}
        onFleetSizeChange={handleFleetSizeChange}
        onSpawnIncident={handleSpawnIncident}
      />

      {/* 4. Tab Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('map')}
          className={`btn-secondary ${activeTab === 'map' ? 'btn-primary' : ''}`}
          style={{ padding: '9px 18px', fontSize: '0.85rem' }}
        >
          <Map size={16} />
          <span>Interactive 2D Grid & Dispatch Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`btn-secondary ${activeTab === 'benchmarks' ? 'btn-primary' : ''}`}
          style={{ padding: '9px 18px', fontSize: '0.85rem' }}
        >
          <BarChart3 size={16} />
          <span>RL Models Benchmark Comparison</span>
        </button>
      </div>

      {/* 5. Main Content Area */}
      {activeTab === 'map' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* Left Column: Interactive Map & Live Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CityGridMap
              ambulances={engine.ambulances}
              dispatchBases={engine.dispatchBases}
              hospitals={engine.hospitals}
              hotspots={engine.hotspots}
              incidents={engine.incidents}
              onMapClick={handleMapClick}
            />

            <ResponseChart
              data={engine.callToArrivalTimes}
              algorithmName={currentAlgorithm.name}
            />
          </div>

          {/* Right Column: Live Dispatch Log & System Architecture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <EventLog logs={engine.logs} />

            {/* Quick Architecture Insight Box */}
            <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Info size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>How the AI Optimizes Placement</h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                When an ambulance discharges a patient at the hospital, the Deep Q-Network evaluates all 25 candidate bases. It predicts the expected discounted future response rewards, taking into account current incident risk zones and fleet dispersion.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Markov Decision Process</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Bellman Value Function</span>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Bootstrap Bagging Ensembles</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BenchmarkView />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '40px', padding: '20px 0', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>QAMBO AI — Reinforcement Learning for Ambulance Location Optimization • Pair-Programmed with Antigravity AI</p>
      </footer>

    </div>
  );
};

export default App;
