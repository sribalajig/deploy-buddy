import { useState } from 'react';
import { useStopService } from '../../hooks/useStopService';
import './StopButton.css';

interface StopButtonProps {
  serviceId: string;
  serviceName: string;
  onStopSuccess?: () => void;
  deploymentStatus: string | null;
}

export function StopButton({ serviceId, serviceName, onStopSuccess, deploymentStatus }: StopButtonProps) {
  const { stopService, loading } = useStopService();
  const [stopStatus, setStopStatus] = useState<string | null>(null);

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const result = await stopService(serviceId);
    
    if (result.success) {
      setStopStatus('Service stopped successfully');
      onStopSuccess?.();
    } else {
      setStopStatus(`Failed to stop: ${result.message || 'Unknown error'}`);
    }
  
    setTimeout(() => setStopStatus(null), 5000);
  };

  const isDisabled = loading || deploymentStatus?.toLowerCase() === 'removed';

  return (
    <div className="stop-button-container">
      <button
        className={`stop-button ${loading ? 'loading' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={handleStop}
        disabled={isDisabled}
        title={deploymentStatus === 'Removed' ? 'Service is already removed' : `Stop ${serviceName}`}
      >
        {loading ? 'Stopping...' : 'Stop'}
      </button>
      {/* ... existing status message ... */}
    </div>
  );
}