import 'reflect-metadata';
import { container } from 'tsyringe';
import RailwayService from './models/railway-service';
import { RailwayServices } from './services/railway-services';
import { RailwayServicesController } from './controllers/railway-services';

// Register dependencies
container.register('RailwayService', {
  useValue: new RailwayService('', '')
});

container.register('RailwayServices', RailwayServices);

container.register('RailwayServicesController', RailwayServicesController);

export default container;