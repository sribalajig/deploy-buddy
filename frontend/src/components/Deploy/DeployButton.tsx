import { useState } from 'react';
import { useDeployService } from '../../hooks/useDeployService';
import './DeployButton.css';

interface DeployButtonProps {
  serviceId: string;
  serviceName: string;
  environmentId: string | null;
}

export function DeployButton({ serviceId, serviceName, environmentId }: DeployButtonProps) {
  const { deploy, loading, error } = useDeployService();
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to parent
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
  
    // Clear status message after 5 seconds
    setTimeout(() => setDeploymentStatus(null), 5000);
  };

  const isDisabled = !environmentId || loading;

  return (
    <div className="deploy-button-container">
      <button
        className={`deploy-button ${isDisabled ? 'disabled' : ''}`}
        onClick={handleDeploy}
        disabled={isDisabled}
        title={!environmentId ? 'Select an environment first' : `Start ${serviceName}`}
      >
        {loading ? 'Starting...' : 'Start'}
      </button>
      {deploymentStatus && (
        <div className={`deployment-status ${error ? 'error' : 'success'}`}>
          {deploymentStatus}
        </div>
      )}
    </div>
  );
}