export class ProjectDetails {
    constructor(public services: Service[], public environments: Environment[]) {
        this.services = services;
        this.environments = environments;
    }
}

export class Environment {
    constructor(public id: string, public name: string) {
        this.id = id;
        this.name = name;
    }
}

export class Service {
    constructor(public id: string, public name: string) {
        this.id = id;
        this.name = name;
    }
}

export class DeploymentInstance {
    constructor(public deploymentId?: string, public success?: boolean) {
        this.deploymentId = deploymentId;
        this.success = success;
    }
}

export class Deployment {
    constructor(
        public id: string,
        public createdAt: string,
        public updatedAt: string,
        public status: string,
        public statusUpdatedAt: string,
        public staticUrl: string | null,
        public service: Service
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.statusUpdatedAt = statusUpdatedAt;
        this.staticUrl = staticUrl;
        this.service = service;
    }
}