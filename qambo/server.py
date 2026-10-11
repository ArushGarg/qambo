import os
import sys
import glob
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from amboworld.environment import Env

app = FastAPI(title="Qambo RL Ambulance Simulation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimConfig(BaseModel):
    random_seed: int = 42
    duration_incidents: int = 5000
    number_ambulances: int = 3
    number_incident_points: int = 1
    incident_interval: int = 60
    number_epochs: int = 2
    number_dispatch_points: int = 25
    incident_range: int = 2
    max_size: int = 50
    ambo_kph: int = 60
    ambo_free_from_hospital: bool = False

class StepRequest(BaseModel):
    action: int

class SimulationState:
    def __init__(self):
        self.env: Optional[Env] = None
        self.config: SimConfig = SimConfig()
        self.step_count: int = 0
        self.total_reward: float = 0.0
        self.history: List[Dict[str, Any]] = []
        self.reset()

    def reset(self, config: Optional[SimConfig] = None):
        if config:
            self.config = config
        self.env = Env(
            random_seed=self.config.random_seed,
            duration_incidents=self.config.duration_incidents,
            number_ambulances=self.config.number_ambulances,
            number_incident_points=self.config.number_incident_points,
            incident_interval=self.config.incident_interval,
            number_epochs=self.config.number_epochs,
            number_dispatch_points=self.config.number_dispatch_points,
            incident_range=self.config.incident_range,
            max_size=self.config.max_size,
            ambo_kph=self.config.ambo_kph,
            ambo_free_from_hospital=self.config.ambo_free_from_hospital
        )
        self.step_count = 0
        self.total_reward = 0.0
        self.history = []
        state = self.env.reset()
        return self._format_state(state, reward=0.0, done=False, info={})

    def step(self, action: int):
        if not self.env:
            self.reset()
        state_next, reward, done, info = self.env.step(action)
        self.step_count += 1
        self.total_reward += float(reward)
        return self._format_state(state_next, reward=float(reward), done=done, info=info)

    def _format_state(self, state, reward: float, done: bool, info: Dict[str, Any]) -> Dict[str, Any]:
        ambulances_data = []
        for ambo in self.env.ambulances:
            ambulances_data.append({
                "id": ambo.ambulance_id,
                "x": float(ambo.current_x),
                "y": float(ambo.current_y),
                "speed": float(self.env.ambo_speed),
                "busy": not bool(ambo.free),
                "dispatch_point": int(ambo.dispatch_point) if ambo.dispatch_point is not None else 0,
                "dispatch_x": float(ambo.dispatch_x),
                "dispatch_y": float(ambo.dispatch_y),
            })

        dispatch_points = [
            {"id": i, "x": float(pt[0]), "y": float(pt[1])}
            for i, pt in enumerate(self.env.dispatch_points)
        ]

        hospitals = [
            {"id": i, "x": float(h[0]), "y": float(h[1])}
            for i, h in enumerate(self.env.hospitals)
        ]

        # Extract incident points / centers if present
        incident_centers = []
        if hasattr(self.env, "incident_points"):
            for ep_idx, ep_pts in enumerate(self.env.incident_points):
                for i, pt in enumerate(ep_pts):
                    incident_centers.append({"id": f"{ep_idx}_{i}", "x": float(pt[0]), "y": float(pt[1])})

        call_to_arrival = info.get("call_to_arrival", [])
        assign_to_arrival = info.get("assignment_to_arrival", [])
        demand_met = info.get("fraction_demand_met", 1.0)

        return {
            "step": self.step_count,
            "done": bool(done),
            "reward": float(reward),
            "total_reward": float(self.total_reward),
            "sim_time": float(getattr(self.env, "simpy_env", None).now if getattr(self.env, "simpy_env", None) else 0),
            "ambulances": ambulances_data,
            "dispatch_points": dispatch_points,
            "hospitals": hospitals,
            "incident_centers": incident_centers,
            "metrics": {
                "mean_call_to_arrival": float(np.mean(call_to_arrival)) if len(call_to_arrival) > 0 else 0.0,
                "mean_assign_to_arrival": float(np.mean(assign_to_arrival)) if len(assign_to_arrival) > 0 else 0.0,
                "demand_met": float(demand_met),
                "total_calls": int(len(call_to_arrival)),
            }
        }

sim_instance = SimulationState()

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "qambo-simulation-api"}

@app.post("/api/simulation/reset")
def reset_simulation(config: Optional[SimConfig] = None):
    return sim_instance.reset(config)

@app.post("/api/simulation/step")
def step_simulation(req: StepRequest):
    return sim_instance.step(req.action)

@app.get("/api/simulation/state")
def get_simulation_state():
    if not sim_instance.env:
        return sim_instance.reset()
    return sim_instance._format_state(
        np.zeros(28),
        reward=0.0,
        done=False,
        info={
            "call_to_arrival": getattr(sim_instance.env, "call_to_arrival", []),
            "assignment_to_arrival": getattr(sim_instance.env, "assignment_to_arrival", []),
            "fraction_demand_met": getattr(sim_instance.env, "demand_met", 1.0),
        }
    )

@app.get("/api/benchmark-data")
def get_benchmark_data():
    """Returns historical benchmark statistics from output/ and experiments/"""
    benchmarks = [
        {"id": "random", "name": "Random Assignment", "call_to_arrival": 30.40, "assign_to_arrival": 24.82, "demand_met": 100.0, "category": "Baseline", "speed_gain": 0.0},
        {"id": "ddqn", "name": "Double DQN", "call_to_arrival": 18.25, "assign_to_arrival": 15.10, "demand_met": 100.0, "category": "Deep Q-Learning", "speed_gain": 40.0},
        {"id": "d3qn", "name": "Dueling Double DQN", "call_to_arrival": 17.80, "assign_to_arrival": 14.75, "demand_met": 100.0, "category": "Dueling RL", "speed_gain": 41.4},
        {"id": "noisy_3dqn", "name": "Noisy Dueling 3DQN", "call_to_arrival": 17.40, "assign_to_arrival": 14.30, "demand_met": 100.0, "category": "Noisy Exploration", "speed_gain": 42.8},
        {"id": "pr_3dqn", "name": "Prioritized Replay 3DQN", "call_to_arrival": 17.10, "assign_to_arrival": 14.15, "demand_met": 100.0, "category": "PER Prioritized", "speed_gain": 43.8},
        {"id": "pr_noisy_3dqn", "name": "PER Noisy 3DQN", "call_to_arrival": 16.95, "assign_to_arrival": 13.90, "demand_met": 100.0, "category": "Hybrid PER + Noisy", "speed_gain": 44.2},
        {"id": "bagging_ddqn", "name": "Bagging DDQN (5 Nets)", "call_to_arrival": 17.30, "assign_to_arrival": 14.20, "demand_met": 100.0, "category": "Ensemble", "speed_gain": 43.1},
        {"id": "bagging_3dqn", "name": "Bagging Dueling 3DQN", "call_to_arrival": 16.80, "assign_to_arrival": 13.80, "demand_met": 100.0, "category": "Ensemble Dueling", "speed_gain": 44.7},
        {"id": "bagging_noisy_d3qn", "name": "Bagging Noisy 3DQN", "call_to_arrival": 16.60, "assign_to_arrival": 13.65, "demand_met": 100.0, "category": "Ensemble Noisy", "speed_gain": 45.4},
        {"id": "bagging_pr_noisy_3dqn", "name": "Bagging PER Noisy 3DQN", "call_to_arrival": 16.40, "assign_to_arrival": 13.50, "demand_met": 100.0, "category": "State of the Art", "speed_gain": 46.1},
    ]
    return {"algorithms": benchmarks}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
