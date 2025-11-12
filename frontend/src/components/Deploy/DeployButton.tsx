import { useState } from 'react';
import { useDeployService } from '../../hooks/useDeployService';
import './DeployButton.css';
import { shouldDisableStart } from '../../utils/deployment-status';

interface DeployButtonProps {
  serviceId: string;
  serviceName: string;
  environmentId: string | null;
  latestDeploymentStatus: string | null;
}

export function DeployButton({ serviceId, serviceName, environmentId, latestDeploymentStatus }: DeployButtonProps) {
  const { deploy, loading } = useDeployService();
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!environmentId) {
      setDeploymentStatus('Please select an environment first');
      return;
    }

    const result = await deploy(environmentId, serviceId);

    if (result.success) {
      setDeploymentStatus(`Deployment started! ID: ${result.deploymentId}`);
    } else {
      setDeploymentStatus(`Deployment failed: ${result.message || 'Unknown error'}`);
    }

    setTimeout(() => setDeploymentStatus(null), 5000);
  };

  const isDisabled = loading || shouldDisableStart(latestDeploymentStatus);

  return (
    <div className="deploy-button-container">
      <button
        className={`deploy-button ${isDisabled ? 'disabled' : ''}`}
        onClick={handleDeploy}
        disabled={isDisabled}
        title={
          deploymentStatus === 'Removed'
            ? 'Cannot start removed service'
            : !environmentId
              ? 'Select an environment first'
              : `Start ${serviceName}`
        }
      >
        {loading ? 'Starting...' : 'Start'}
      </button>
    </div>
  );
}