export interface RailwayService {
    id: string;
    name: string;
}

export interface RailwayEnvironment {
    id: string;
    name: string;
}

export interface ProjectDetails {
    services: RailwayService[];
    environments: RailwayEnvironment[];
}