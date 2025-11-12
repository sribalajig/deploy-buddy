import { useDeployments } from '../../hooks/useDeployments';
import type { RailwayService, RailwayEnvironment } from '../../types/railway-service';
import './DeploymentsSidebar.css';

interface DeploymentsSidebarProps {
  environment: RailwayEnvironment | null;
  service: RailwayService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeploymentsSidebar({ environment, service, isOpen, onClose }: DeploymentsSidebarProps) {
  const { deployments, loading, error, refetch } = useDeployments(
    environment?.id || null, 
    service?.id || null);

  return (
    <div className={`deployments-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>{service?.name || 'Deployments'}</h2>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          ×
        </button>
      </div>

      <div className="sidebar-content">
        {!isOpen && (
          <div className="sidebar-empty">Select a service to view deployments</div>
        )}

        {isOpen && loading && (
          <div className="sidebar-loading">Loading deployments...</div>
        )}

        {isOpen && error && (
          <div className="sidebar-error">
            <p>Error: {error}</p>
            <button onClick={refetch} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {isOpen && !loading && !error && deployments.length === 0 && (
          <div className="sidebar-empty">No deployments found</div>
        )}

        {isOpen && !loading && !error && deployments.length > 0 && (
          <ul className="deployments-list">
            {deployments.map((deployment, index) => (
              <li key={deployment.id} className={`deployment-item ${index === 0 ? 'current-deployment' : ''}`}>
                {index === 0 && (
                  <div className="current-deployment-label">Current deployment</div>
                )}
                <div className="deployment-header">
                  <div className={`deployment-status status-${deployment.status?.toLowerCase() || 'unknown'}`}>
                    {deployment.status ? deployment.status.charAt(0) + deployment.status.slice(1).toLowerCase() : 'Unknown'}
                  </div>
                  <div className="deployment-meta">
                    <span className="deployment-time">
                      Created: {new Date(deployment.createdAt).toLocaleString()}
                    </span>
                    <span className="deployment-time">
                      Updated: {new Date(deployment.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}