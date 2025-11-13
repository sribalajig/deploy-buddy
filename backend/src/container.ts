import 'reflect-metadata';
import { container } from 'tsyringe';
import { RailwayProxy } from './services/railway-proxy';
import { DeploymentStreamingService } from './services/deployment-streaming';
import { RailwayProxyController } from './controllers/railway-proxy-controller';
import { ProjectDetails } from './models/railway-proxy';

container.register('ProjectDetails', {
  useValue: new ProjectDetails([], [])
});

container.register('RailwayProxy', RailwayProxy);
container.register('DeploymentStreamingService', DeploymentStreamingService);
container.register('RailwayProxyController', RailwayProxyController);

export default container;