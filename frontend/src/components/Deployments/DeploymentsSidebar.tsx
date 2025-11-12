import { useDeployments } from '../../hooks/useDeployments';
import type { RailwayService } from '../../types/railway-service';
import './DeploymentsSidebar.css';

interface DeploymentsSidebarProps {
  service: RailwayService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeploymentsSidebar({ service, isOpen, onClose }: DeploymentsSidebarProps) {
  const { deployments, loading, error, refetch } = useDeployments(service?.id || null);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="deployments-sidebar">
        <div className="sidebar-header">
          <h2>{service?.name || 'Deployments'}</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        </div>
        
        <div className="sidebar-content">
          {loading && (
            <div className="sidebar-loading">Loading deployments...</div>
          )}

          {error && (
            <div className="sidebar-error">
              <p>Error: {error}</p>
              <button onClick={refetch} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && deployments.length === 0 && (
            <div className="sidebar-empty">No deployments found</div>
          )}

          {!loading && !error && deployments.length > 0 && (
            <ul className="deployments-list">
              {deployments.map((deployment) => (
                <li key={deployment.id} className="deployment-item">
                  <div className="deployment-header">
                    <div className="deployment-status">
                      <span className={`status-badge status-${deployment.status.toLowerCase()}`}>
                        {deployment.status}
                      </span>
                    </div>
                    <div className="deployment-id">{deployment.id.substring(0, 8)}...</div>
                  </div>
                  <div className="deployment-details">
                    <div className="deployment-time">
                      <strong>Created:</strong> {new Date(deployment.createdAt).toLocaleString()}
                    </div>
                    <div className="deployment-time">
                      <strong>Updated:</strong> {new Date(deployment.updatedAt).toLocaleString()}
                    </div>
                    {deployment.staticUrl && (
                      <div className="deployment-url">
                        <a href={deployment.staticUrl} target="_blank" rel="noopener noreferrer">
                          {deployment.staticUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}