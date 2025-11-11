export function getConfig(key: string, defaultValue?: string): string {
    const value = process.env[key];
    return value || defaultValue || '';
  }