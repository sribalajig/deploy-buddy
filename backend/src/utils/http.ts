import { getConfig } from "./config";
import { GraphQLResponse } from "../models/railway-api-response";

export async function executeGraphQLQuery(
    query: string, 
    variables?: Record<string, any>): Promise<GraphQLResponse> {
    const response = await fetch(getConfig('RAILWAY_API_URL'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getConfig('RAILWAY_TOKEN')}`,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GraphQLResponse;

    if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`);
    }

    return data;
}