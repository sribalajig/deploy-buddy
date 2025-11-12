export interface RailwayService {
    id: string;
    name: string;
    latestDeployment?: {
        id: string;
        status: string;
        canRedeploy: boolean;
        deploymentStopped: boolean;
        environmentId: string;
        createdAt: string;
        updatedAt: string;
        statusUpdatedAt: string;
    } | null;
}

export interface RailwayEnvironment {
    id: string;
    name: string;
}

export interface ProjectDetails {
    services: RailwayService[];
    environments: RailwayEnvironment[];
}

export interface Deployment {
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