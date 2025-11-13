import { useState, useEffect } from 'react';
import { API_CONFIG } from '../utils/config';
import type { Deployment } from '../types/types';

interface UseDeploymentsReturn {
  deployments: Deployment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  upsertDeployment: (deployment: Deployment) => void;
  fetchDeployment: (deploymentId: string, environmentId: string, serviceId: string, onFetched?: (deployment: Deployment) => void) => Promise<void>;
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

  const fetchDeployment = async (deploymentId: string, environmentId: string, serviceId: string, onFetched?: (deployment: Deployment) => void) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${deploymentId}/${environmentId}/${serviceId}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        throw new Error(`Failed to fetch deployment: ${response.status} ${response.statusText}`);
      }
      
      const deployment: Deployment = await response.json();
      upsertDeployment(deployment);
      onFetched?.(deployment);
    } catch (err) {
      console.error('Error fetching deployment:', err);
    }
  };

  const upsertDeployment = (deployment: Deployment) => {
    setDeployments(prev => {
      const existingIndex = prev.findIndex(d => d.id === deployment.id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = deployment;
        return updated.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return [deployment, ...prev].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  };

  useEffect(() => {
    fetchDeployments();
  }, [serviceId]);

  return {
    deployments,
    loading,
    error,
    refetch: fetchDeployments,
    upsertDeployment,
    fetchDeployment,
  };
}