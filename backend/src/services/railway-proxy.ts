import { injectable } from 'tsyringe';
import { executeGraphQLQuery } from '../utils/http';
import { getConfig } from '../utils/config';
import { ProjectDetails, Service, Environment, DeploymentInstance, Deployment } from '../models/railway-proxy';
import { DeployData, DeploymentsData, GraphQLResponse, ProjectData } from '../utils/railway-api-response';

interface IRailwayProxy {
    getProjectDetails(): Promise<ProjectDetails>;
    deployService(environmentId: string, serviceId: string): Promise<DeploymentInstance>;
    getDeployments(serviceId: string, first?: number): Promise<Deployment[]>;
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
                    serviceInstanceDeployV2(environmentId: $environmentId, serviceId: $serviceId)
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

    public async getDeployments(serviceId: string, first: number = 10): Promise<Deployment[]> {
        try {
            const query = `
                query GetDeployments($serviceId: String!, $first: Int!) {
                    deployments(input: {serviceId: $serviceId}, first: $first) {
                        edges {
                            node {
                                id
                                createdAt
                                updatedAt
                                status
                                statusUpdatedAt
                                staticUrl
                                service {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            `;

            const result = await executeGraphQLQuery(query, {
                serviceId,
                first,
            });

            const deploymentsData = result.data as DeploymentsData;
            const deployments = deploymentsData?.deployments?.edges?.map(edge =>
                new Deployment(
                    edge.node.id,
                    edge.node.createdAt,
                    edge.node.updatedAt,
                    edge.node.status,
                    edge.node.statusUpdatedAt,
                    edge.node.staticUrl,
                    new Service(edge.node.service.id, edge.node.service.name)
                )
            ) ?? [];

            return deployments;
        } catch (error) {
            console.error('Error fetching deployments:', error);
            throw error;
        }
    }
    
    private async getProjectData(): Promise<ProjectDetails> {
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
