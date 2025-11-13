import { useState, useEffect } from 'react';
import { useDeployService } from '../../hooks/useDeployService';
import './DeployButton.css';
import { shouldDisableStart, isTerminalState } from '../../utils/deployment-status';

interface DeployButtonProps {
  serviceId: string;
  serviceName: string;
  environmentId: string | null;
  latestDeploymentStatus: string | null;
  onStatusUpdate?: (status: string) => void;
  onStreamClosed?: () => void;
  onDeployStart?: () => void;
}

export function DeployButton({ serviceId, serviceName, environmentId, latestDeploymentStatus, onStatusUpdate, onStreamClosed, onDeployStart }: DeployButtonProps) {
  const { deploy, loading } = useDeployService();
  const [currentStatus, setCurrentStatus] = useState<string | null>(latestDeploymentStatus);
  const [isDeployingState, setIsDeployingState] = useState<boolean>(false);

  useEffect(() => {
    setCurrentStatus(latestDeploymentStatus);
    if (latestDeploymentStatus && !isTerminalState(latestDeploymentStatus)) {
      setIsDeployingState(true);
    } else {
      setIsDeployingState(false);
    }
  }, [latestDeploymentStatus]);

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!environmentId) {
      return;
    }

    setIsDeployingState(true);

    const result = await deploy(environmentId, serviceId, (status: string) => {
      setCurrentStatus(status);
      onStatusUpdate?.(status);
      if (isTerminalState(status)) {
        setIsDeployingState(false);
        onStreamClosed?.();
      }
    });

    if (result.success && result.deploymentId) {
      onDeployStart?.();
    }

    if (!result.success) {
      setIsDeployingState(false);
    }
  };

  const isDisabled = loading || shouldDisableStart(currentStatus);
  const isDeploying = isDeployingState || (currentStatus && !isTerminalState(currentStatus));
  const isInitializing = currentStatus?.toUpperCase() === 'INITIALIZING';

  return (
    <div className="deploy-button-container">
      <button
        className={`deploy-button ${isDisabled ? 'disabled' : ''} ${isInitializing ? 'initializing' : isDeploying ? 'deploying' : ''}`}
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
        {loading || isDeploying ? 'Starting...' : 'Start'}
      </button>
    </div>
  );
}