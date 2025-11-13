import { injectable } from 'tsyringe';
import { RailwayProxy } from './railway-proxy';
import { Deployment } from '../models/railway-proxy';
import { ISSEStream, IClientConnection } from '../utils/sse-stream';

const TERMINAL_STATES = ['SUCCESS', 'FAILED', 'REMOVED', 'SKIPPED', 'CRASHED'];

interface IDeploymentStreamingService {
  streamDeploymentStatus(
    deploymentId: string,
    environmentId: string,
    serviceId: string,
    stream: ISSEStream,
    connection: IClientConnection
  ): Promise<void>;
}

@injectable()
export class DeploymentStreamingService implements IDeploymentStreamingService {
  constructor(private railwayProxy: RailwayProxy) {}

  async streamDeploymentStatus(
    deploymentId: string,
    environmentId: string,
    serviceId: string,
    stream: ISSEStream,
    connection: IClientConnection
  ): Promise<void> {
    this.setupSSEHeaders(stream);

    const pollInterval = this.createPollInterval(
      deploymentId,
      environmentId,
      serviceId,
      stream
    );

    await this.sendInitialStatus(
      deploymentId,
      environmentId,
      serviceId,
      stream,
      pollInterval
    );

    this.setupCleanup(connection, pollInterval, stream);
  }

  private setupSSEHeaders(stream: ISSEStream): void {
    stream.setHeader('Content-Type', 'text/event-stream');
    stream.setHeader('Cache-Control', 'no-cache');
    stream.setHeader('Connection', 'keep-alive');
    stream.setHeader('X-Accel-Buffering', 'no');
  }

  private createPollInterval(
    deploymentId: string,
    environmentId: string,
    serviceId: string,
    stream: ISSEStream
  ): NodeJS.Timeout {
    const pollInterval = setInterval(async () => {
      const deployment = await this.findDeployment(
        deploymentId,
        environmentId,
        serviceId
      );

      if (!deployment) {
        this.sendError(stream, 'Deployment not found');
        return;
      }

      this.sendStatus(stream, deployment.status);

      if (this.isTerminalState(deployment.status)) {
        clearInterval(pollInterval);
        stream.end();
      }
    }, 5000);
    
    return pollInterval;
  }

  private async sendInitialStatus(
    deploymentId: string,
    environmentId: string,
    serviceId: string,
    stream: ISSEStream,
    pollInterval: NodeJS.Timeout
  ): Promise<void> {
    try {
      const deployment = await this.findDeployment(
        deploymentId,
        environmentId,
        serviceId
      );

      if (!deployment) {
        this.sendError(stream, 'Deployment not found');
        clearInterval(pollInterval);
        stream.end();
        return;
      }

      this.sendStatus(stream, deployment.status);

      if (this.isTerminalState(deployment.status)) {
        clearInterval(pollInterval);
        stream.end();
      }
    } catch (error) {
      console.error('Error fetching initial deployment status:', error);
      this.sendError(stream, 'Error fetching deployment status');
      clearInterval(pollInterval);
      stream.end();
    }
  }

  private async findDeployment(
    deploymentId: string,
    environmentId: string,
    serviceId: string
  ): Promise<Deployment | null> {
    try {
      const deployments = await this.railwayProxy.getDeployments(
        environmentId,
        serviceId,
        1
      );

      const latestDeployment = deployments[0];
      if (latestDeployment?.id === deploymentId) {
        return latestDeployment;
      }

      const allDeployments = await this.railwayProxy.getDeployments(
        environmentId,
        serviceId,
        10
      );

      return allDeployments.find(d => d.id === deploymentId) || null;
    } catch (error) {
      console.error('Error finding deployment:', error);
      return null;
    }
  }

  private sendStatus(stream: ISSEStream, status: string): void {
    stream.write(`data: ${JSON.stringify({ status })}\n\n`);
  }

  private sendError(stream: ISSEStream, error: string): void {
    stream.write(`data: ${JSON.stringify({ error })}\n\n`);
    stream.end();
  }

  private isTerminalState(status: string): boolean {
    return TERMINAL_STATES.includes(status.toUpperCase());
  }

  private setupCleanup(
    connection: IClientConnection,
    pollInterval: NodeJS.Timeout,
    stream: ISSEStream
  ): void {
    connection.onDisconnect(() => {
      clearInterval(pollInterval);
      stream.end();
    });
  }
}

export type { IDeploymentStreamingService };
