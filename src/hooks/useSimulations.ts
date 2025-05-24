// src/hooks/useSimulations.ts
import { useState } from 'react';


interface Simulation {
  id: string;
  userId: string;
  symbol: string;
  amount: number;
  months: number;
  result: number;
  timestamp: string;
}

// src/hooks/useSimulations.ts (custom hook)
export const useSimulations = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);

  const loadSimulations = () => {
    const saved = localStorage.getItem('simulations') || '[]';
    setSimulations(JSON.parse(saved));
  };

  const saveSimulation = (data: Omit<Simulation, 'id'>) => {
    const newSimulation = { ...data, id: Date.now().toString() };
    const updated = [...simulations, newSimulation];
    localStorage.setItem('simulations', JSON.stringify(updated));
  };

  return { simulations, loadSimulations, saveSimulation };
};