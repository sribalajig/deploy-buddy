import { FastifyRequest, FastifyReply } from 'fastify';
import { RailwayProxy } from '../services/railway-proxy';
import { injectable } from 'tsyringe';

@injectable()
export class RailwayProxyController {
  constructor(private railwayProxyService: RailwayProxy) {}

  async getAvailableServices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const services = await this.railwayProxyService.getAvailableServices();
      return reply.code(200).send({ services });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch railway services' });
    }
  }
}