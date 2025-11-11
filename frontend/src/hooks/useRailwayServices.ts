import { useState, useEffect } from 'react';
import type { RailwayService, ServicesResponse } from '../types/railway-service';
import { API_CONFIG } from '../utils/config';

interface UseRailwayServicesReturn {
  services: RailwayService[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRailwayServices(): UseRailwayServicesReturn {
  const [services, setServices] = useState<RailwayService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/railway-proxy/available-services`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }
      
      const data: ServicesResponse = await response.json();
      setServices(data.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
}