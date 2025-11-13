import { FastifyRequest, FastifyReply } from 'fastify';
import { RailwayProxy } from '../services/railway-proxy';
import { injectable } from 'tsyringe';
import { DeployServiceParams, GetDeploymentsParams, RemoveDeploymentParams, GetDeploymentLogsParams, GetDeploymentParams } from './request-dtos';
import { DeploymentStreamingService } from '../services/railway-deployment-streaming';
import { ISSEStream, IClientConnection } from '../utils/sse-stream';

@injectable()
export class RailwayProxyController {
  constructor(
    private railwayProxyService: RailwayProxy,
    private deploymentStreamingService: DeploymentStreamingService
  ) { }

  async getProjectDetails(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projectDetails = await this.railwayProxyService.getProjectDetails();
      return reply.code(200).send(projectDetails);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch railway services' });
    }
  }

  async deployService(
    request: FastifyRequest<{ Params: DeployServiceParams }>,
    reply: FastifyReply
  ) {
    try {
      const deploymentInstance = await this.railwayProxyService.deployService(
        request.params.environmentId,
        request.params.serviceId
      );

      if (!deploymentInstance.success) {
        return reply.code(500).send({ error: 'Failed to deploy service' });
      }

      return reply.code(200).send(deploymentInstance);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to deploy service' });
    }
  }

  async streamDeploymentStatus(
    request: FastifyRequest<{ 
      Params: { deploymentId: string; environmentId: string; serviceId: string } 
    }>,
    reply: FastifyReply
  ) {
    try {
      const origin = request.headers.origin;
      if (origin) {
        reply.raw.setHeader('Access-Control-Allow-Origin', origin);
        reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      const stream = this.createSSEStream(reply);
      const connection = this.createClientConnection(request);

      await this.deploymentStreamingService.streamDeploymentStatus(
        request.params.deploymentId,
        request.params.environmentId,
        request.params.serviceId,
        stream,
        connection
      );
    } catch (error) {
      request.log.error(error);
      reply.code(500).send({ error: 'Failed to stream deployment status' });
    }
  }

  private createSSEStream(reply: FastifyReply): ISSEStream {
    return {
      write: (data: string) => reply.raw.write(data),
      end: () => reply.raw.end(),
      setHeader: (name: string, value: string) => reply.raw.setHeader(name, value)
    };
  }

  private createClientConnection(request: FastifyRequest): IClientConnection {
    return {
      onDisconnect: (callback: () => void) => {
        request.raw.on('close', callback);
      }
    };
  }

  async getDeployments(request: FastifyRequest<{ Params: GetDeploymentsParams }>, reply: FastifyReply) {
    try {
      const deployments = await this.railwayProxyService.getDeployments(
        request.params.environmentId,
        request.params.serviceId
      );
      return reply.code(200).send(deployments);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch deployments' });
    }
  }

  async removeDeployment(
    request: FastifyRequest<{ Params: RemoveDeploymentParams }>,
    reply: FastifyReply
  ) {
    try {
      const success = await this.railwayProxyService.removeDeployment(request.params.deploymentId);
      
      if (!success) {
        return reply.code(500).send({ error: 'Failed to remove deployment' });
      }

      return reply.code(200).send({ success: true });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to remove deployment' });
    }
  }

  async getDeploymentLogs(
    request: FastifyRequest<{ Params: GetDeploymentLogsParams; Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 100;
      const logs = await this.railwayProxyService.getDeploymentLogs(
        request.params.deploymentId,
        limit
      );
      return reply.code(200).send(logs);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch deployment logs' });
    }
  }

  async getDeployment(
    request: FastifyRequest<{ Params: GetDeploymentParams }>,
    reply: FastifyReply
  ) {
    try {
      const deployment = await this.railwayProxyService.getDeployment(
        request.params.deploymentId,
        request.params.environmentId,
        request.params.serviceId
      );
      
      if (!deployment) {
        return reply.code(404).send({ error: 'Deployment not found' });
      }
      
      return reply.code(200).send(deployment);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch deployment' });
    }
  }
}