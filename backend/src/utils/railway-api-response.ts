interface EnvironmentNode {
    id: string;
    name: string;
}

interface ServiceNode {
    id: string;
    name: string;
    deployments?: {
        edges: Array<{
            node: {
                status: string;
                id: string;
                canRedeploy: boolean;
                deploymentStopped: boolean;
                environmentId: string;
                createdAt: string;
                updatedAt: string;
                statusUpdatedAt: string;
            };
        }>;
    };
}

export interface ProjectData {
    project: {
        environments: {
            edges: Array<{
                node: EnvironmentNode;
            }>;
        };
        services: {
            edges: Array<{
                node: ServiceNode;
            }>;
        };
    };
}

export interface DeployData {
    serviceInstanceDeployV2?: string;
}

interface DeploymentNode {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    statusUpdatedAt: string;
    staticUrl: string | null;
    service: {
        id: string;
        name: string;
    };
}

export interface DeploymentsData {
    deployments: {
        edges: Array<{
            node: DeploymentNode;
        }>;
    };
}

export interface DeploymentLogsData {
    deploymentLogs: Array<{
        message: string;
        severity: string;
        timestamp: string;
    }>;
}

interface GraphQLError {
    message: string;
    locations?: Array<{
        line: number;
        column: number;
    }>;
    path?: string[];
    extensions?: {
        code: string;
        [key: string]: any;
    };
    traceId?: string;
}

export interface GraphQLResponse {
    data?: any;
    errors?: GraphQLError[];
}