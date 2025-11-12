import type { RailwayService } from '../../types/railway-service';
import { DeployButton } from '../Deploy/DeployButton';
import { StopButton } from '../StopService/StopButton';
import './ServicesList.css';

interface ServicesListProps {
  services: RailwayService[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  selectedEnvironmentId?: string | null;
  onServiceClick?: (service: RailwayService) => void;
  selectedServiceId?: string | null;
}

export function ServicesList({
  services,
  loading = false,
  error = null,
  onRefresh,
  selectedEnvironmentId,
  onServiceClick,
  selectedServiceId
}: ServicesListProps) {
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
          const status = service.latestDeployment?.status ?? null;
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
                  />
                  <StopButton
                    service={service}
                    onStopSuccess={onRefresh}
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