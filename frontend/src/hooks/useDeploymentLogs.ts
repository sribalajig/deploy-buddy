import { useState, useEffect } from 'react';
import { API_CONFIG } from '../utils/config';

export interface DeploymentLog {
  message: string;
  severity: string;
  timestamp: string;
}

interface UseDeploymentLogsReturn {
  logs: DeploymentLog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeploymentLogs(deploymentId: string | null, limit: number = 100): UseDeploymentLogsReturn {
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!deploymentId) {
      setLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${deploymentId}/logs?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }
      
      const data: DeploymentLog[] = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [deploymentId]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
}
