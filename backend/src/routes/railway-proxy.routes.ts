import { FastifyInstance } from 'fastify';
import container from '../container';
import { RailwayProxyController } from '../controllers/railway-proxy';

export async function railwayProxyRoutes(fastify: FastifyInstance) {
  const controller = container.resolve<RailwayProxyController>('RailwayProxyController');

  fastify.get('/api/railway-proxy/project-details', controller.getProjectDetails.bind(controller));
  fastify.post('/api/railway-proxy/deploy/:environmentId/:serviceId', controller.deployService.bind(controller));
  fastify.get('/api/railway-proxy/deployments/:serviceId', controller.getDeployments.bind(controller));
}