import { injectable } from 'tsyringe';
import { executeGraphQLQuery } from '../utils/railway-http-client';
import { getConfig } from '../utils/config';
import { ProjectDetails, Service, Environment, DeploymentInstance, Deployment, DeploymentLog } from '../models/railway-proxy';
import { DeployData, DeploymentsData, GraphQLResponse, ProjectData, DeploymentLogsData } from '../utils/railway-api-response';
import { RailwayQueries, RailwayMutations } from './railway-gql-queries';

interface IRailwayProxy {
    getProjectDetails(): Promise<ProjectDetails>;
    deployService(environmentId: string, serviceId: string): Promise<DeploymentInstance>;
    getDeployments(environmentId: string, serviceId: string, first?: number): Promise<Deployment[]>;
    getDeployment(deploymentId: string, environmentId: string, serviceId: string): Promise<Deployment | null>;
    removeDeployment(deploymentId: string): Promise<boolean>;
    getDeploymentLogs(deploymentId: string, limit?: number): Promise<DeploymentLog[]>;
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
            const result: GraphQLResponse = await executeGraphQLQuery(RailwayMutations.DEPLOY_SERVICE, {
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

    public async getDeployments(environmentId: string, serviceId: string, first: number = 10): Promise<Deployment[]> {
        try {
            const result = await executeGraphQLQuery(RailwayQueries.GET_DEPLOYMENTS, {
                environmentId,
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
                )
            ) ?? [];

            return deployments;
        } catch (error) {
            console.error('Error fetching deployments:', error);
            throw error;
        }
    }

    public async removeDeployment(deploymentId: string): Promise<boolean> {
        try {
            const result = await executeGraphQLQuery(RailwayMutations.REMOVE_DEPLOYMENT, {
                id: deploymentId,
            });

            const removeData = result.data as { deploymentRemove?: boolean };
            return removeData?.deploymentRemove ?? false;
        } catch (error) {
            console.error('Error removing deployment:', error);
            throw error;
        }
    }

    public async getDeploymentLogs(deploymentId: string, limit: number = 100): Promise<DeploymentLog[]> {
        try {
            const result = await executeGraphQLQuery(RailwayQueries.GET_DEPLOYMENT_LOGS, {
                deploymentId,
                limit,
            });

            const logsData = result.data as DeploymentLogsData;
            const logs = logsData?.deploymentLogs?.map(log =>
                new DeploymentLog(log.message, log.severity, log.timestamp)
            ) ?? [];

            return logs;
        } catch (error) {
            console.error('Error fetching deployment logs:', error);
            throw error;
        }
    }

    public async getDeployment(deploymentId: string, environmentId: string, serviceId: string): Promise<Deployment | null> {
        try {
            const deployments = await this.getDeployments(environmentId, serviceId, 10);
            return deployments.find(d => d.id === deploymentId) || null;
        } catch (error) {
            console.error('Error fetching deployment:', error);
            throw error;
        }
    }

    private async getProjectData(): Promise<ProjectDetails> {
        const result = await executeGraphQLQuery(RailwayQueries.GET_PROJECT, {
            projectId: getConfig('DEPLOY_BUDDY_RAILWAY_PROJECT_ID'),
        });

        const projectData = result.data as ProjectData;

        const environments: Environment[] = projectData?.project?.environments?.edges?.map(edge =>
            new Environment(edge.node.id, edge.node.name)
        ) ?? [];

        const defaultEnvironmentId = environments[0]?.id;

        const services: Service[] = await Promise.all(
            (projectData?.project?.services?.edges ?? []).map(async (edge) => {
                const service = new Service(edge.node.id, edge.node.name);

                if (defaultEnvironmentId) {
                    const latestDeployment = await this.getLatestDeploymentForService(
                        defaultEnvironmentId,
                        edge.node.id,
                    );
                    service.latestDeployment = latestDeployment ?? undefined;
                }

                return service;
            })
        );

        return new ProjectDetails(
            services,
            environments
        );
    }

    private async getLatestDeploymentForService(environmentId: string, serviceId: string): Promise<Deployment | null> {
        try {
            const deployments = await this.getDeployments(environmentId, serviceId, 1);
            const latest = deployments[0];

            if (!latest) {
                return null;
            }

            return new Deployment(
                latest.id,
                latest.createdAt,
                latest.updatedAt,
                latest.status,
                latest.statusUpdatedAt,
                latest.staticUrl,
            );
        } catch (error) {
            console.error(`Error fetching latest deployment for service ${serviceId}:`, error);
            return null;
        }
    }
}

export type { IRailwayProxy as IRailwayService };