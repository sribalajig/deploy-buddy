import { injectable } from 'tsyringe';
import { executeGraphQLQuery } from '../utils/http';
import { getConfig } from '../utils/config';
import { ProjectDetails, Service, Environment, DeploymentInstance } from '../models/railway-proxy';
import { DeployData, GraphQLResponse, ProjectData } from '../utils/railway-api-response';

interface IRailwayProxy {
    getProjectDetails(): Promise<ProjectDetails>;
    deployService(environmentId: string, serviceId: string): Promise<DeploymentInstance>;
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

    public async deployService(environmentId: string, serviceId: string): Promise<DeploymentInstance> {
        try {
            const mutation = `
                mutation DeployService($environmentId: String!, $serviceId: String!) {
                    serviceInstanceDeployV2(environmentId: $environmentId, serviceId: $serviceId) {
                        id
                    }
                }
            `;

            const result: GraphQLResponse = await executeGraphQLQuery(mutation, {
                environmentId,
                serviceId,
            });

            const deployData = result.data as DeployData;
            const deploymentId = deployData?.serviceInstanceDeployV2;

            if (deploymentId) {
                return {
                    deploymentId,
                    success: true,
                };
            }

            return {
                success: false,
            };
        } catch (error) {
            console.error('Error deploying service:', error);
            return {
                success: false,
            };
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

        const projectData = result.data as ProjectData;

        const services: Service[] = projectData?.project?.services?.edges?.map(edge =>
            new Service(edge.node.id, edge.node.name)
        ) ?? [];

        const environments: Environment[] = projectData?.project?.environments?.edges?.map(edge =>
            new Environment(edge.node.id, edge.node.name)
        ) ?? [];

        return new ProjectDetails(
            services,
            environments
        );
    }
}

export type { IRailwayProxy as IRailwayService };
