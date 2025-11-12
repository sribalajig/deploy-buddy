import { useState } from 'react';
import { API_CONFIG } from '../utils/config';
import type { RailwayService } from '../types/railway-service';

interface StopServiceResponse {
  success: boolean;
  message?: string;
}

interface UseStopServiceReturn {
  stopService: (service: RailwayService) => Promise<StopServiceResponse>;
  loading: boolean;
  error: string | null;
}

export function useStopService(): UseStopServiceReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const stopService = async (service: RailwayService): Promise<StopServiceResponse> => {
    try {
      setLoading(true);
      setError(null);
              
      if (!service.latestDeployment) {
        return {
          success: false,
          message: 'No deployments found to stop',
        };
      }

      const deleteResponse = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${service.latestDeployment.id}`,
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