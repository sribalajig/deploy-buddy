import { FastifyRequest, FastifyReply } from 'fastify';
import { RailwayServices } from '../services/railway-services';
import { injectable } from 'tsyringe';

@injectable()
export class RailwayServicesController {
  constructor(private railwayServices: RailwayServices) {}

  async getAvailableServices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const services = await this.railwayServices.getAvailableServices();
      return reply.code(200).send({ services });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch railway services' });
    }
  }
}