import 'dotenv/config';
import Fastify from 'fastify';
import { railwayProxyRoutes } from './routes/railway-proxy.routes';

const fastify = Fastify({
  logger: true
});

fastify.register(railwayProxyRoutes);

const defaultPort = 3000;

const start = async () => {
  let applicationPort: number = defaultPort;

  const configuredPort = process.env.PORT;
  if (configuredPort === undefined || configuredPort === '') {
    fastify.log.warn(`PORT is not set, using default port ${defaultPort}`);
  } else {
    applicationPort = Number(configuredPort);
  }

  fastify.log.info(`Configured port: ${configuredPort}`);

  try {
    await fastify.listen({ port: Number(applicationPort) });
    fastify.log.info(`Server is running on http://localhost:${applicationPort}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();