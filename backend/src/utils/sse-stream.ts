export interface ISSEStream {
  write(data: string): void;
  end(): void;
  setHeader(name: string, value: string): void;
}

export interface IClientConnection {
  onDisconnect(callback: () => void): void;
}
