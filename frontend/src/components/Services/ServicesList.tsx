import type { RailwayService } from '../../types/railway-service';
import { DeployButton } from '../Deploy/DeployButton';
import { StopButton } from '../StopService/StopButton';
import './ServicesList.css';
import { useState, useEffect } from 'react';

interface ServicesListProps {
  services: RailwayService[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSidebarRefresh?: () => void;
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
  selectedServiceId
}: ServicesListProps) {
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, string | null>>({});

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
                        {status.charAt(0) + status.slice(1).toLowerCase()}
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
                    onStatusUpdate={(newStatus) => updateServiceStatus(service.id, newStatus)}
                    onStreamClosed={() => handleStreamClosed()}
                    onDeployStart={onSidebarRefresh}
                  />
                  <StopButton
                    serviceId={service.id}
                    serviceName={service.name}
                    environmentId={selectedEnvironmentId ?? null}
                    latestDeploymentStatus={status}
                    latestDeploymentId={service.latestDeployment?.id ?? null}
                    onStatusUpdate={(newStatus) => updateServiceStatus(service.id, newStatus)}
                    onStreamClosed={() => handleStreamClosed()}
                    onStopStart={onSidebarRefresh}
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