export const RailwayQueries = {
    GET_PROJECT: `
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
    `,
  
    GET_DEPLOYMENTS: `
      query GetDeployments($environmentId: String!, $serviceId: String!, $first: Int!) {
        deployments(input: {environmentId: $environmentId, serviceId: $serviceId}, first: $first) {
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
    `,
  
    GET_DEPLOYMENT_LOGS: `
      query GetDeploymentLogs($deploymentId: String!, $limit: Int!) {
        deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
          message
          severity
          timestamp
        }
      }
    `,
  };
  
  export const RailwayMutations = {
    DEPLOY_SERVICE: `
      mutation DeployService($environmentId: String!, $serviceId: String!) {
        serviceInstanceDeployV2(environmentId: $environmentId, serviceId: $serviceId)
      }
    `,
  
    REMOVE_DEPLOYMENT: `
      mutation RemoveDeployment($id: String!) {
        deploymentRemove(id: $id)
      }
    `,
  };