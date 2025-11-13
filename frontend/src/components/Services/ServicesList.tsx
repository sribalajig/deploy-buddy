import type { RailwayService } from '../../types/railway-service';
import { DeployButton } from '../Deploy/DeployButton';
import { StopButton } from '../StopService/StopButton';
import { formatStatusDisplay } from '../../utils/deployment-status';
import './ServicesList.css';
import { useState, useEffect } from 'react';

interface ServicesListProps {
  services: RailwayService[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSidebarRefresh?: () => void;
  onDeploymentUpdate?: (deploymentId: string) => void;
  selectedEnvironmentId?: string | null;
  onServiceClick?: (service: RailwayService) => void;
  selectedServiceId?: string | null;
}

export function ServicesList({
  services,
  loading = false,
  error = null,
  onRefresh,
  onSidebarRefresh,
  selectedEnvironmentId,
  onServiceClick,
  selectedServiceId,
  onDeploymentUpdate
}: ServicesListProps) {
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, string | null>>({});
  const [activeDeploymentIds, setActiveDeploymentIds] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const initialStatuses: Record<string, string | null> = {};
    services.forEach(service => {
      initialStatuses[service.id] = service.latestDeployment?.status ?? null;
    });
    setServiceStatuses(initialStatuses);
  }, [services]);

  const updateServiceStatus = (serviceId: string, status: string | null) => {
    setServiceStatuses(prev => ({ ...prev, [serviceId]: status }));
  };

  const handleStreamClosed = () => {
    if (onSidebarRefresh) {
      setTimeout(() => {
        onSidebarRefresh();
      }, 500);
    }
  };

  const handleStatusUpdate = (serviceId: string, status: string | null, deploymentId?: string) => {
    updateServiceStatus(serviceId, status);
    if (deploymentId && onDeploymentUpdate) {
      onDeploymentUpdate(deploymentId);
    }
  };

  if (loading) {
    return (
      <div className="services-list-container">
        <div className="loading">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-list-container">
        <div className="error">
          <p>Error: {error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className="retry-button">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="services-list-container">
        <div className="empty">No services available</div>
      </div>
    );
  }

  return (
    <div className="services-list-container">
      <ul className="services-list">
        {services.map((service) => {
          const status = serviceStatuses[service.id] ?? service.latestDeployment?.status ?? null;
          const lastDeployedAt = service.latestDeployment?.updatedAt;

          return (
            <li
              key={service.id}
              className={`service-item ${selectedServiceId === service.id ? 'selected' : ''}`}
              onClick={() => onServiceClick?.(service)}
            >
              <div className="service-header">
                <div className="service-info">
                  <div className="service-meta">
                    <div className="service-name">{service.name}</div>
                    {lastDeployedAt && (
                      <span className="service-last-deployed">
                        Last deployed: {new Date(lastDeployedAt).toLocaleString()}
                      </span>
                    )}
                    {status && (
                      <div className={`service-status status-${status.toLowerCase()}`}>
                        {formatStatusDisplay(status)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="service-actions">
                  <DeployButton
                    serviceId={service.id}
                    serviceName={service.name}
                    environmentId={selectedEnvironmentId ?? null}
                    latestDeploymentStatus={status}
                    onStatusUpdate={(newStatus, deploymentId) => {
                      const idToUse = deploymentId || activeDeploymentIds[service.id];
                      handleStatusUpdate(service.id, newStatus, idToUse || undefined);
                    }}
                    onStreamClosed={() => handleStreamClosed()}
                    onDeployStart={(deploymentId) => {
                      if (deploymentId) {
                        setActiveDeploymentIds(prev => ({ ...prev, [service.id]: deploymentId }));
                        handleStatusUpdate(service.id, null, deploymentId);
                      }
                    }}
                  />
                  <StopButton
                    serviceId={service.id}
                    serviceName={service.name}
                    environmentId={selectedEnvironmentId ?? null}
                    latestDeploymentStatus={status}
                    latestDeploymentId={service.latestDeployment?.id ?? null}
                    onStatusUpdate={(newStatus) => {
                      const deploymentId = service.latestDeployment?.id;
                      handleStatusUpdate(service.id, newStatus, deploymentId || undefined);
                    }}
                    onStreamClosed={() => handleStreamClosed()}
                    onStopStart={() => {
                      const deploymentId = service.latestDeployment?.id;
                      if (deploymentId) {
                        handleStatusUpdate(service.id, null, deploymentId);
                      }
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}