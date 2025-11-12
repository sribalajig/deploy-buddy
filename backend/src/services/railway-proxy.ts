import { injectable } from 'tsyringe';
import { executeGraphQLQuery } from '../utils/http';
import { getConfig } from '../utils/config';
import { ProjectDetails, Service, Environment } from '../models/railway-proxy';

interface IRailwayProxy {
    getProjectDetails(): Promise<ProjectDetails>;
}

@injectable()
export class RailwayProxy implements IRailwayProxy {
    public async getProjectDetails(): Promise<ProjectDetails> {
        try {
            const projectData = await this.getProjectData();

            return projectData;
        } catch (error) {
            console.error('Error fetching railway services:', error);
            throw error;
        }
    }

    public async getProjectData(): Promise<ProjectDetails> {
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

        const services: Service[] = result.data?.project?.services?.edges?.map(edge => 
            new Service(edge.node.id, edge.node.name)
        ) ?? [];
        
        const environments: Environment[] = result.data?.project?.environments?.edges?.map(edge => 
            new Environment(edge.node.id, edge.node.name)
        ) ?? [];

        return new ProjectDetails(
            services,
            environments
        );
    }
}

export type { IRailwayProxy as IRailwayService };
