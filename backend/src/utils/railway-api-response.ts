interface EnvironmentNode {
    id: string;
    name: string;
}

interface ServiceNode {
    id: string;
    name: string;
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