import RailwayService from '../models/railway-service';
import { injectable } from 'tsyringe';
import { executeGraphQLQuery } from '../utils/http';
import { getConfig } from '../utils/config';
import { GraphQLResponse } from '../models/railway-api-response';

interface IRailwayProxy {
    getAvailableServices(): Promise<RailwayService[]>;
}

@injectable()
export class RailwayProxy implements IRailwayProxy {
    public async getAvailableServices(): Promise<RailwayService[]> {
        try {
            const data = await this.getProjectData();
            
            if (!data?.project?.services) {
                return [];
            }

            return data.project.services.edges.map(edge => 
                new RailwayService(edge.node.id, edge.node.name)
            );
        } catch (error) {
            console.error('Error fetching railway services:', error);
            throw error;
        }
    }    

    public async getProjectData(): Promise<GraphQLResponse['data']> {
        const query = `
            query GetProject($projectId: String!) {
                project(id: $projectId) {
                    environments {
                        edges {
                            node {
                                id
                                name
                            }
                        }
                    }
                    services {
                        edges {
                            node {
                                id
                                name
                            }
                        }
                    }
                }
            }
        `;

        const result = await executeGraphQLQuery(query, {
            projectId: getConfig('RAILWAY_PROJECT_ID'),
        });

        return result.data;
    }
}

export type { IRailwayProxy as IRailwayService };
