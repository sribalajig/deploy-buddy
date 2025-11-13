import { useState, useEffect } from 'react';
import type { ProjectDetails } from '../types/types';
import { API_CONFIG } from '../utils/config';

interface UseProjectDetailsReturn {
  projectDetails: ProjectDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRailwayProjectDetails(): UseProjectDetailsReturn {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/railway-proxy/project-details`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }
      
      const data: ProjectDetails = await response.json();
      setProjectDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProjectDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  return {
    projectDetails,
    loading,
    error,
    refetch: fetchProjectDetails,
  };
}