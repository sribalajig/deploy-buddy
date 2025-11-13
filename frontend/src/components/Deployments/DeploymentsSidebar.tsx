import { useState, useImperativeHandle, forwardRef } from 'react';
import { useDeployments } from '../../hooks/useDeployments';
import { useDeploymentLogs } from '../../hooks/useDeploymentLogs';
import type { RailwayService, RailwayEnvironment, Deployment } from '../../types/railway-service';
import { formatStatusDisplay } from '../../utils/deployment-status';
import './DeploymentsSidebar.css';

interface DeploymentsSidebarProps {
  environment: RailwayEnvironment | null;
  service: RailwayService | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface DeploymentsSidebarRef {
  refetch: () => void;
  upsertDeployment: (deployment: Deployment) => void;
  fetchDeployment: (deploymentId: string, environmentId: string, serviceId: string, onFetched?: (deployment: Deployment) => void) => Promise<void>;
}

export const DeploymentsSidebar = forwardRef<DeploymentsSidebarRef, DeploymentsSidebarProps>(
  ({ environment, service, isOpen, onClose }, ref) => {
    const { deployments, loading, error, refetch, upsertDeployment, fetchDeployment } = useDeployments(
      environment?.id || null, 
      service?.id || null);
    const [expandedDeploymentId, setExpandedDeploymentId] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      refetch,
      upsertDeployment,
      fetchDeployment,
    }));

    const toggleLogs = (deploymentId: string) => {
      setExpandedDeploymentId(expandedDeploymentId === deploymentId ? null : deploymentId);
    };

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
              {deployments.map((deployment, index) => {
                const isExpanded = expandedDeploymentId === deployment.id;
                return (
                  <li key={deployment.id} className={`deployment-item ${index === 0 ? 'current-deployment' : ''}`}>
                    {index === 0 && (
                      <div className="current-deployment-label">Current deployment</div>
                    )}
                    <div className="deployment-header">
                      <div className={`deployment-status status-${deployment.status?.toLowerCase() || 'unknown'}`}>
                        {formatStatusDisplay(deployment.status)}
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
                    <button 
                      className="show-logs-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLogs(deployment.id);
                      }}
                    >
                      {isExpanded ? 'Hide logs' : 'Show logs'}
                    </button>
                    {isExpanded && <DeploymentLogs deploymentId={deployment.id} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const { logs, loading, error } = useDeploymentLogs(deploymentId);

  if (loading) {
    return <div className="deployment-logs-loading">Loading logs...</div>;
  }

  if (error) {
    return <div className="deployment-logs-error">Error: {error}</div>;
  }

  if (logs.length === 0) {
    return <div className="deployment-logs-empty">No logs available</div>;
  }

  return (
    <div className="deployment-logs">
      {logs.map((log, index) => (
        <div key={index} className={`log-line log-severity-${log.severity.toLowerCase()}`}>
          <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
          <span className="log-message">{log.message}</span>
        </div>
      ))}
    </div>
  );
}