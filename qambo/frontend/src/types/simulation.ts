export type AmbulanceStatus = 'idle' | 'dispatched' | 'transporting' | 'returning';

export interface Ambulance {
  id: number;
  x: number;
  y: number;
  status: AmbulanceStatus;
  speed: number;
  currentBaseId: number;
  targetX?: number;
  targetY?: number;
  targetType?: 'incident' | 'hospital' | 'base';
  assignedIncidentId?: number;
  path?: { x: number; y: number }[];
}

export interface Incident {
  id: number;
  x: number;
  y: number;
  reportedTime: number;
  status: 'pending' | 'assigned' | 'resolved';
  assignedAmbulanceId?: number;
  callToArrival?: number;
  assignToArrival?: number;
}

export interface Hospital {
  id: number;
  x: number;
  y: number;
  name: string;
}

export interface DispatchBase {
  id: number;
  x: number;
  y: number;
  ambulancesPresent: number;
}

export interface Hotspot {
  id: number;
  x: number;
  y: number;
  radius: number;
  name: string;
}

export interface SimulationMetrics {
  avgCallToArrival: number;
  avgAssignToArrival: number;
  demandMet: number;
  totalCalls: number;
  resolvedCalls: number;
  simTime: number;
  activeEpoch: 'Day Shift' | 'Night Shift';
}

export interface DispatchLogItem {
  id: string;
  simTime: number;
  type: 'alert' | 'dispatch' | 'hospital' | 'reposition';
  title: string;
  detail: string;
  ambulanceId?: number;
}

export interface AlgorithmOption {
  id: string;
  name: string;
  category: string;
  callToArrival: number;
  assignToArrival: number;
  improvement: number;
  isRecommended?: boolean;
}
