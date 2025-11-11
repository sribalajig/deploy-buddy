import RailwayService from '../models/railway-service';
import { injectable } from 'tsyringe';

interface IRailwayService {
    getAvailableServices(): Promise<RailwayService[]>;
}

@injectable()
export class RailwayServices implements IRailwayService {
    public async getAvailableServices(): Promise<RailwayService[]> {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    }
}

export type { IRailwayService };
