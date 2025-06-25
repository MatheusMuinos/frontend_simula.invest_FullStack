import { useState, useCallback } from 'react';
import apiClient from '../services/api';

export interface Simulation {
  id: number;
  userId: number;
  tipo: 'acao' | 'renda-fixa';
  nome: string;
  valor: number | null;
  invest_inicial: number;
  invest_mensal: number;
  meses: number;
  inflacao: number;
  createdAt: string;
  updatedAt: string;
}

type SimulationUpdatePayload = Partial<Omit<Simulation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> & {
    simulationId: number;
};

export const useSimulations = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Simulation[]>('/get-Simulations');
      const sorted = response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSimulations(sorted);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load simulations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSimulation = useCallback(async (simulationPayload: Omit<Simulation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Simulation>('/log-Simulation', simulationPayload);
      setSimulations(prev => [response.data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save simulation.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSimulation = useCallback(async (payload: SimulationUpdatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<Simulation>('/patch-simulation', payload);
      setSimulations(prev => prev.map(sim => sim.id === payload.simulationId ? response.data : sim));
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update simulation.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSimulation = useCallback(async (simulationId: number) => {
    setIsLoading(true);
    setError(null);
    try {
        await apiClient.delete('/delete-Simulation', { data: { simulationId } });
        setSimulations(prev => prev.filter(sim => sim.id !== simulationId));
    } catch (err: any) {
        setError(err.response?.data?.message || "Could not delete simulation.");
        throw err;
    } finally {
        setIsLoading(false);
    }
  }, []);

  return { 
    simulations, 
    isLoading, 
    error, 
    fetchSimulations, 
    addSimulation,
    updateSimulation,
    deleteSimulation
  };
};