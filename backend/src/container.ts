import 'reflect-metadata';
import { container } from 'tsyringe';
import { RailwayProxy } from './services/railway-proxy';
import { RailwayProxyController } from './controllers/railway-proxy';
import { ProjectDetails } from './models/railway-proxy';

container.register('ProjectDetails', {
  useValue: new ProjectDetails([], [])
});

container.register('RailwayProxy', RailwayProxy);

container.register('RailwayProxyController', RailwayProxyController);

export default container;