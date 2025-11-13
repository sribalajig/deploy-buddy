import { useState, useRef, useCallback } from 'react';
import { API_CONFIG } from '../utils/config';
import { isTerminalState } from '../utils/deployment-status';

interface DeployResponse {
  deploymentId?: string;
  success: boolean;
  message?: string;
}

interface DeploymentStatusUpdate {
  status?: string;
  error?: string;
}

interface UseDeployServiceReturn {
  deploy: (environmentId: string, serviceId: string, onStatusUpdate?: (status: string) => void, onStreamClosed?: () => void) => Promise<DeployResponse>;
  loading: boolean;
  error: string | null;
}

export function useDeployService(): UseDeployServiceReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const deploy = useCallback(async (
    environmentId: string, 
    serviceId: string,
    onStatusUpdate?: (status: string) => void,
    onStreamClosed?: () => void
  ): Promise<DeployResponse> => {
    try {
      setLoading(true);
      setError(null);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

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
      
      if (data.success && data.deploymentId && onStatusUpdate) {
        const eventSource = new EventSource(
          `${API_CONFIG.BACKEND_URL}/api/railway-proxy/deployments/${data.deploymentId}/status/${environmentId}/${serviceId}`
        );

        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const update: DeploymentStatusUpdate = JSON.parse(event.data);
            
            if (update.error) {
              console.error('Deployment status error:', update.error);
              eventSource.close();
              eventSourceRef.current = null;
              onStreamClosed?.();
              return;
            }

            if (update.status) {
              onStatusUpdate(update.status);

              if (isTerminalState(update.status)) {
                eventSource.close();
                eventSourceRef.current = null;
                onStreamClosed?.();
              }
            }
          } catch (err) {
            console.error('Error parsing deployment status:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('EventSource error:', err);
          eventSource.close();
          eventSourceRef.current = null;
          onStreamClosed?.();
        };
      }

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
  }, []);

  return {
    deploy,
    loading,
    error,
  };
}