import { FastifyRequest, FastifyReply } from 'fastify';
import { RailwayProxy } from '../services/railway-proxy';
import { injectable } from 'tsyringe';
import { DeployServiceParams } from './request-dto';

@injectable()
export class RailwayProxyController {
  constructor(private railwayProxyService: RailwayProxy) { }

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

  async getDeployments(request: FastifyRequest<{ Params: DeployServiceParams }>, reply: FastifyReply) {
    try {
      const deployments = await this.railwayProxyService.getDeployments(request.params.serviceId);
      return reply.code(200).send(deployments);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch deployments' });
    }
  }
}