const TERMINAL_STATES = ['SUCCESS', 'FAILED', 'REMOVED', 'SKIPPED', 'CRASHED'] as const;
const NON_TERMINAL_STATES = ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'QUEUED', 'WAITING', 'NEEDS_APPROVAL', 'REMOVING', 'SLEEPING'] as const;

export function isTerminalState(status: string | null | undefined): boolean {
  if (!status) return false;
  return TERMINAL_STATES.includes(status.toUpperCase() as typeof TERMINAL_STATES[number]);
}

export function isNonTerminalState(status: string | null | undefined): boolean {
  if (!status) return false;
  return NON_TERMINAL_STATES.includes(status.toUpperCase() as typeof NON_TERMINAL_STATES[number]);
}

export function shouldDisableStart(status: string | null | undefined): boolean {
  if (!status) return false;
  const upperStatus = status.toUpperCase();
  return upperStatus === 'SUCCESS' || isNonTerminalState(status);
}