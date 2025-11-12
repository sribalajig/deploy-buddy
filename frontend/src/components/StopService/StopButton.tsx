import { useState } from 'react';
import { useStopService } from '../../hooks/useStopService';
import './StopButton.css';

interface StopButtonProps {
  serviceId: string;
  serviceName: string;
  onStopSuccess?: () => void;
}

export function StopButton({ serviceId, serviceName, onStopSuccess }: StopButtonProps) {
  const { stopService, loading, error } = useStopService();
  const [stopStatus, setStopStatus] = useState<string | null>(null);

  const handleStop = async () => {
    const result = await stopService(serviceId);
    
    if (result.success) {
      setStopStatus('Service stopped successfully');
      // Call success callback if provided
      onStopSuccess?.();
    } else {
      setStopStatus(`Failed to stop: ${result.message || 'Unknown error'}`);
    }

    // Clear status message after 5 seconds
    setTimeout(() => setStopStatus(null), 5000);
  };

  return (
    <div className="stop-button-container">
      <button
        className={`stop-button ${loading ? 'loading' : ''}`}
        onClick={handleStop}
        disabled={loading}
        title={`Stop ${serviceName}`}
      >
        {loading ? 'Stopping...' : 'Stop'}
      </button>
      {stopStatus && (
        <div className={`stop-status ${error ? 'error' : 'success'}`}>
          {stopStatus}
        </div>
      )}
    </div>
  );
}