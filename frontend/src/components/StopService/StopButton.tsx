import { useState } from 'react';
import { useStopService } from '../../hooks/useStopService';
import './StopButton.css';
import { isNonTerminalState, shouldDisableStop } from '../../utils/deployment-status';
import type { RailwayService } from '../../types/railway-service';

interface StopButtonProps {
  service: RailwayService;
  onStopSuccess?: () => void;
}

export function StopButton({ service, onStopSuccess }: StopButtonProps) {
  const { stopService, loading } = useStopService();
  const [stopStatus, setStopStatus] = useState<string | null>(null);

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const result = await stopService(service);
    
    if (result.success) {
      setStopStatus('Service stopped successfully');
      onStopSuccess?.();
    } else {
      setStopStatus(`Failed to stop: ${result.message || 'Unknown error'}`);
    }
  
    setTimeout(() => setStopStatus(null), 5000);
  };

  const deploymentStatus = service.latestDeployment?.status ?? null;
  const isDisabled = loading || shouldDisableStop(deploymentStatus ?? null);

  return (
    <div className="stop-button-container">
      <button
        className={`stop-button ${loading ? 'loading' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={handleStop}
        disabled={isDisabled}
        title={
          deploymentStatus?.toUpperCase() === 'REMOVED' 
            ? 'Service is already removed' 
            : isNonTerminalState(deploymentStatus)
            ? 'Cannot stop service while deployment is in progress'
            : `Stop ${service.name}`
        }
      >
        {loading ? 'Stopping...' : 'Stop'}
      </button>
    </div>
  );
}