import { useState } from 'react';
import { API_CONFIG } from '../utils/config';

interface DeployResponse {
  deploymentId?: string;
  success: boolean;
  message?: string;
}

interface UseDeployServiceReturn {
  deploy: (environmentId: string, serviceId: string) => Promise<DeployResponse>;
  loading: boolean;
  error: string | null;
}

export function useDeployService(): UseDeployServiceReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deploy = async (environmentId: string, serviceId: string): Promise<DeployResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deploy/${environmentId}/${serviceId}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Deployment failed: ${response.status} ${response.statusText}`);
      }

      const data: DeployResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    deploy,
    loading,
    error,
  };
}