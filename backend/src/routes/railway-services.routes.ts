import { FastifyInstance } from 'fastify';
import container from '../container';
import { RailwayServicesController } from '../controllers/railway-services';

export async function railwayServicesRoutes(fastify: FastifyInstance) {
  const controller = container.resolve<RailwayServicesController>('RailwayServicesController');

  fastify.get('/railway-services', controller.getAvailableServices.bind(controller));
}