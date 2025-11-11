import { useRailwayServices } from '../../hooks/useRailwayServices';
import './ServicesList.css';

export function ServicesList() {
  const { services, loading, error, refetch } = useRailwayServices();

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
          <button onClick={refetch} className="retry-button">
            Retry
          </button>
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
      <div className="services-header">
        <h2>Railway Services</h2>
        <button onClick={refetch} className="refresh-button">
          Refresh
        </button>
      </div>
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