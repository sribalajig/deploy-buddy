import 'reflect-metadata';
import { container } from 'tsyringe';
import RailwayService from './models/railway-service';
import { RailwayProxy } from './services/railway-proxy';
import { RailwayProxyController } from './controllers/railway-proxy';

// Register dependencies
container.register('RailwayService', {
  useValue: new RailwayService('', '')
});

container.register('RailwayProxy', RailwayProxy);

container.register('RailwayProxyController', RailwayProxyController);

export default container;