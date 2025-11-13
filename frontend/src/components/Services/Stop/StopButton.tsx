import { useState, useEffect } from 'react';
import { useStopService } from '../../../hooks/useStopService';
import './StopButton.css';
import { shouldDisableStop, isTerminalState } from '../../../utils/deployment-status';

interface StopButtonProps {
  serviceId: string;
  serviceName: string;
  environmentId: string | null;
  latestDeploymentStatus: string | null;
  latestDeploymentId: string | null;
  onStatusUpdate?: (status: string, deploymentId?: string) => void;
  onStreamClosed?: () => void;
  onStopStart?: () => void;
}

export function StopButton({ 
  serviceId, 
  serviceName, 
  environmentId, 
  latestDeploymentStatus, 
  latestDeploymentId,
  onStatusUpdate, 
  onStreamClosed, 
  onStopStart 
}: StopButtonProps) {
  const { stopService, loading } = useStopService();
  const [currentStatus, setCurrentStatus] = useState<string | null>(latestDeploymentStatus);
  const [isStoppingState, setIsStoppingState] = useState<boolean>(false);

  useEffect(() => {
    setCurrentStatus(latestDeploymentStatus);
    if (latestDeploymentStatus && !isTerminalState(latestDeploymentStatus)) {
      const upperStatus = latestDeploymentStatus.toUpperCase();
      if (upperStatus === 'REMOVING') {
        setIsStoppingState(true);
      } else {
        setIsStoppingState(false);
      }
    } else {
      setIsStoppingState(false);
    }
  }, [latestDeploymentStatus]);

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!environmentId || !latestDeploymentId) {
      return;
    }

    setIsStoppingState(true);

    const result = await stopService(environmentId, serviceId, latestDeploymentId, (status: string) => {
      setCurrentStatus(status);
      onStatusUpdate?.(status, latestDeploymentId);
      if (isTerminalState(status)) {
        setIsStoppingState(false);
        onStreamClosed?.();
      }
    });

    if (result.success) {
      onStopStart?.();
    }

    if (!result.success) {
      setIsStoppingState(false);
    }
  };

  const isDisabled = loading || shouldDisableStop(currentStatus);
  const isStopping = isStoppingState || (currentStatus?.toUpperCase() === 'REMOVING');

  return (
    <div className="stop-button-container">
      <button
        className={`stop-button ${isDisabled ? 'disabled' : ''} ${isStopping ? 'loading' : ''}`}
        onClick={handleStop}
        disabled={isDisabled}
        title={
          currentStatus?.toUpperCase() === 'REMOVED'
            ? 'Service is already removed'
            : !environmentId
              ? 'Select an environment first'
              : !latestDeploymentId
                ? 'No deployment to stop'
                : `Stop ${serviceName}`
        }
      >
        {loading || isStopping ? 'Stopping...' : 'Stop'}
      </button>
    </div>
  );
}
