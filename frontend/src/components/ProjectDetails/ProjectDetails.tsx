import { useState } from 'react';
import { useRailwayProjectDetails } from '../../hooks/useRailwayProjectDetailsReturn';
import { ServicesList } from '../Services/ServicesList';
import { EnvironmentsDropdown } from '../Environments/EnvironmentsDropdown';
import type { RailwayEnvironment } from '../../types/railway-service';
import './ProjectDetails.css';

export function ProjectDetails() {
  const { projectDetails, loading, error, refetch } = useRailwayProjectDetails();
  const [selectedEnvironment, setSelectedEnvironment] = useState<RailwayEnvironment | null>(null);

  // Set first environment as default when data loads
  useState(() => {
    if (projectDetails?.environments && projectDetails.environments.length > 0 && !selectedEnvironment) {
      setSelectedEnvironment(projectDetails.environments[0]);
    }
  });

  if (loading) {
    return (
      <div className="project-details-container">
        <div className="loading">Loading project details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={refetch} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!projectDetails) {
    return (
      <div className="project-details-container">
        <div className="empty">No project details available</div>
      </div>
    );
  }

  return (
    <div className="project-details-container">
      <div className="project-details-header">
        <div className="project-details-actions">
          <EnvironmentsDropdown
            environments={projectDetails.environments}
            selectedEnvironment={selectedEnvironment}
            onEnvironmentChange={setSelectedEnvironment}
          />
          <button onClick={refetch} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>
      <div className="project-details-content">
        <ServicesList
          services={projectDetails.services}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}