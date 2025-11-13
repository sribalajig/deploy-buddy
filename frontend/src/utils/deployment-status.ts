const TERMINAL_STATES = ['SUCCESS', 'FAILED', 'REMOVED', 'SKIPPED', 'CRASHED'] as const;
const NON_TERMINAL_STATES = ['BUILDING', 'DEPLOYING', 'QUEUED', 'PENDING', 'INITIALIZING', 'REMOVING'] as const;

export function isTerminalState(status: string | null | undefined): boolean {
  if (!status) return false;
  return TERMINAL_STATES.includes(status.toUpperCase() as typeof TERMINAL_STATES[number]);
}

export function isNonTerminalState(status: string | null | undefined): boolean {
  if (!status) return false;
  return NON_TERMINAL_STATES.includes(status.toUpperCase() as typeof NON_TERMINAL_STATES[number]);
}

export function formatStatusDisplay(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'SUCCESS') {
    return 'Active';
  }
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function shouldDisableStart(status: string | null | undefined): boolean {
  if (!status) return false;
  const upperStatus = status.toUpperCase();
  return upperStatus === 'SUCCESS' || isNonTerminalState(status);
}

export function shouldDisableStop(status: string | null | undefined): boolean {
    if (!status) return true;
    const upperStatus = status.toUpperCase();
    return upperStatus === 'REMOVED' || isNonTerminalState(status);
}