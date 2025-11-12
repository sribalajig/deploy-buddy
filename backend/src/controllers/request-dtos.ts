export interface DeployServiceParams {
    environmentId: string;
    serviceId: string;
}

export interface RemoveDeploymentParams {
    deploymentId: string;
}

export interface GetDeploymentsParams {
    environmentId: string;
    serviceId: string;
}