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