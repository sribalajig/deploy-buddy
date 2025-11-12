import { FastifyRequest, FastifyReply } from 'fastify';
import { RailwayProxy } from '../services/railway-proxy';
import { injectable } from 'tsyringe';

@injectable()
export class RailwayProxyController {
  constructor(private railwayProxyService: RailwayProxy) {}

  async getProjectDetails(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projectDetails = await this.railwayProxyService.getProjectDetails();
      return reply.code(200).send(projectDetails);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch railway services' });
    }
  }
}