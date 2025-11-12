import { useState } from 'react';
import { API_CONFIG } from '../utils/config';
import type { Deployment } from '../types/railway-service';

interface StopServiceResponse {
  success: boolean;
  message?: string;
}

interface UseStopServiceReturn {
  stopService: (serviceId: string) => Promise<StopServiceResponse>;
  loading: boolean;
  error: string | null;
}

export function useStopService(): UseStopServiceReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stopService = async (serviceId: string): Promise<StopServiceResponse> => {
    try {
      setLoading(true);
      setError(null);

      // First, get the latest deployment for this service
      const deploymentsResponse = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${serviceId}`
      );

      if (!deploymentsResponse.ok) {
        throw new Error(`Failed to fetch deployments: ${deploymentsResponse.status} ${deploymentsResponse.statusText}`);
      }

      const deployments: Deployment[] = await deploymentsResponse.json();
      
      if (deployments.length === 0) {
        return {
          success: false,
          message: 'No deployments found to stop',
        };
      }

      // Get the latest deployment (first in the array)
      const latestDeployment = deployments[0];

      // Delete the latest deployment using the existing delete route
      const deleteResponse = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${latestDeployment.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`Failed to stop service: ${deleteResponse.status} ${deleteResponse.statusText}`);
      }

      const data = await deleteResponse.json();
      return {
        success: data.success || false,
        message: data.message,
      };
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
    stopService,
    loading,
    error,
  };
}