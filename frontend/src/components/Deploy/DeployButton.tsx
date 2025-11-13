import { useState, useEffect } from 'react';
import { useDeployService } from '../../hooks/useDeployService';
import './DeployButton.css';
import { shouldDisableStart, isTerminalState } from '../../utils/deployment-status';

interface DeployButtonProps {
  serviceId: string;
  serviceName: string;
  environmentId: string | null;
  latestDeploymentStatus: string | null;
}

export function DeployButton({ serviceId, serviceName, environmentId, latestDeploymentStatus }: DeployButtonProps) {
  const { deploy, loading } = useDeployService();
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(latestDeploymentStatus);

  useEffect(() => {
    setCurrentStatus(latestDeploymentStatus);
  }, [latestDeploymentStatus]);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!environmentId) {
      setDeploymentStatus('Please select an environment first');
      return;
    }

    const result = await deploy(environmentId, serviceId, (status: string) => {
      setCurrentStatus(status);
      setDeploymentStatus(`Status: ${status}`);
    });

    if (result.success) {
      setDeploymentStatus(`Deployment started! ID: ${result.deploymentId}`);
    } else {
      setDeploymentStatus(`Deployment failed: ${result.message || 'Unknown error'}`);
    }

    if (!result.success) {
      setTimeout(() => setDeploymentStatus(null), 5000);
    }
  };

  useEffect(() => {
    if (currentStatus && isTerminalState(currentStatus)) {
      setTimeout(() => {
        setDeploymentStatus(null);
      }, 3000);
    }
  }, [currentStatus]);

  const isDisabled = loading || shouldDisableStart(currentStatus);
  const isDeploying = currentStatus && !isTerminalState(currentStatus);

  return (
    <div className="deploy-button-container">
      <button
        className={`deploy-button ${isDisabled ? 'disabled' : ''} ${isDeploying ? 'deploying' : ''}`}
        onClick={handleDeploy}
        disabled={isDisabled}
        title={
          currentStatus === 'Removed'
            ? 'Cannot start removed service'
            : !environmentId
              ? 'Select an environment first'
              : `Start ${serviceName}`
        }
      >
        {loading ? 'Starting...' : isDeploying ? `Deploying (${currentStatus})...` : 'Start'}
      </button>
      {deploymentStatus && (
        <div className={`deployment-status ${isTerminalState(currentStatus) ? 'success' : 'info'}`}>
          {deploymentStatus}
        </div>
      )}
    </div>
  );
}