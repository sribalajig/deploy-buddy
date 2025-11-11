interface EnvironmentNode {
    id: string;
    name: string;
}

interface ServiceNode {
    id: string;
    name: string;
}

interface ProjectData {
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

export interface GraphQLResponse {
    data?: ProjectData;
    errors?: Array<{
        message: string;
    }>;
}