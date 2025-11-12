import type { RailwayService } from '../../types/railway-service';
import { DeployButton } from '../Deploy/DeployButton';
import './ServicesList.css';

interface ServicesListProps {
  services: RailwayService[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  selectedEnvironmentId?: string | null;
}

export function ServicesList({ 
  services, 
  loading = false, 
  error = null, 
  onRefresh,
  selectedEnvironmentId 
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
        {services.map((service) => (
          <li key={service.id} className="service-item">
            <div className="service-header">
              <div className="service-info">
                <div className="service-name">{service.name}</div>
                <div className="service-id">{service.id}</div>
              </div>
              <DeployButton
                serviceId={service.id}
                serviceName={service.name}
                environmentId={selectedEnvironmentId}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}