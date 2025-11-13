import { useState, useEffect, useRef } from 'react';
import { useRailwayProjectDetails } from '../../hooks/useRailwayProjectDetailsReturn';
import { ServicesList } from '../Services/ServicesList';
import { EnvironmentsDropdown } from '../Environments/EnvironmentsDropdown';
import { DeploymentsSidebar } from '../Services/Deployments/DeploymentsSidebar';
import type { DeploymentsSidebarRef } from '../Services/Deployments/DeploymentsSidebar';
import type { RailwayEnvironment, RailwayService, Deployment } from '../../types/types';
import './ProjectDetails.css';

export function ProjectDetails() {
  const { projectDetails, loading, error, refetch } = useRailwayProjectDetails();
  const [selectedEnvironment, setSelectedEnvironment] = useState<RailwayEnvironment | null>(null);
  const [selectedService, setSelectedService] = useState<RailwayService | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [services, setServices] = useState<RailwayService[]>([]);
  const sidebarRef = useRef<DeploymentsSidebarRef>(null);

  useEffect(() => {
    if (projectDetails?.services) {
      setServices(projectDetails.services);
    }
  }, [projectDetails]);

  useEffect(() => {
    if (projectDetails?.environments && projectDetails.environments.length > 0 && !selectedEnvironment) {
      setSelectedEnvironment(projectDetails.environments[0]);
    }
  }, [projectDetails, selectedEnvironment]);

  useEffect(() => {
    if (projectDetails?.services && projectDetails.services.length > 0 && !selectedService) {
      setSelectedService(projectDetails.services[0]);
      setIsSidebarOpen(true);
    }
  }, [projectDetails, selectedService]);

  const handleServiceClick = (service: RailwayService) => {
    setSelectedService(service);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedService(null);
  };

  const handleSidebarRefresh = () => {
    sidebarRef.current?.refetch();
  };

  const handleDeploymentUpdate = (deploymentId: string) => {
    if (selectedEnvironment?.id && selectedService?.id) {
      sidebarRef.current?.fetchDeployment(
        deploymentId, 
        selectedEnvironment.id, 
        selectedService.id,
        (deployment: Deployment) => {
          setServices(prev => prev.map(service => {
            if (service.id === selectedService.id) {
              const currentLatest = service.latestDeployment;
              if (!currentLatest || 
                  deployment.id === currentLatest.id || 
                  new Date(deployment.updatedAt) > new Date(currentLatest.updatedAt)) {
                return {
                  ...service,
                  latestDeployment: {
                    id: deployment.id,
                    status: deployment.status,
                    canRedeploy: currentLatest?.canRedeploy ?? false,
                    deploymentStopped: currentLatest?.deploymentStopped ?? false,
                    environmentId: selectedEnvironment.id,
                    createdAt: deployment.createdAt,
                    updatedAt: deployment.updatedAt,
                    statusUpdatedAt: deployment.statusUpdatedAt,
                  }
                };
              }
            }
            return service;
          }));
        }
      );
    }
  };

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
      <div className="project-details-layout">
        <div className="project-details-content">
          <ServicesList
            services={services}
            loading={loading}
            error={error}
            onRefresh={refetch}
            onSidebarRefresh={handleSidebarRefresh}
            onDeploymentUpdate={handleDeploymentUpdate}
            selectedEnvironmentId={selectedEnvironment?.id || null}
            onServiceClick={handleServiceClick}
            selectedServiceId={selectedService?.id || null}
          />
        </div>
        <DeploymentsSidebar
          ref={sidebarRef}
          environment={selectedEnvironment}
          service={selectedService}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
      </div>
    </div>
  );
}