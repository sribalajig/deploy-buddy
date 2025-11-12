import type { RailwayService } from '../../types/railway-service';
import './ServicesList.css';

interface ServicesListProps {
  services: RailwayService[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function ServicesList({ services, loading = false, error = null, onRefresh }: ServicesListProps) {
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
            <div className="service-name">{service.name}</div>
            <div className="service-id">{service.id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}