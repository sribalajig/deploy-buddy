import { useState, useEffect } from 'react';
import { API_CONFIG } from '../utils/config';
import type { Deployment } from '../types/railway-service';

interface UseDeploymentsReturn {
  deployments: Deployment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeployments(environmentId: string | null, serviceId: string | null): UseDeploymentsReturn {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = async () => {
    if (!serviceId) {
      setDeployments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${environmentId}/${serviceId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch deployments: ${response.status} ${response.statusText}`);
      }
      
      const data: Deployment[] = await response.json();
      setDeployments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [serviceId]);

  return {
    deployments,
    loading,
    error,
    refetch: fetchDeployments,
  };
}