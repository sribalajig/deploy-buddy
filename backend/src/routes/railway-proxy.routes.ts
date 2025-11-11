import { FastifyInstance } from 'fastify';
import container from '../container';
import { RailwayProxyController } from '../controllers/railway-proxy';

export async function railwayProxyRoutes(fastify: FastifyInstance) {
  const controller = container.resolve<RailwayProxyController>('RailwayProxyController');

  fastify.get('/railway-proxy/available-services', controller.getAvailableServices.bind(controller));
}