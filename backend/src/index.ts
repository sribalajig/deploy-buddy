import 'dotenv/config';
import Fastify from 'fastify';
import { railwayProxyRoutes } from './routes/railway-proxy.routes';
import { getConfig } from './utils/config';
import cors from '@fastify/cors';

const fastify = Fastify({
    logger: true
  });
  
const corsOrigins = getConfig('CORS_ORIGINS')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

  fastify.register(cors, {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Cache-Control', 'Connection'],
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
    await fastify.listen({ 
      port: Number(applicationPort),
      host: '0.0.0.0'
    });
    fastify.log.info(`Server is running on http://0.0.0.0:${applicationPort}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();