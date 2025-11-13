import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RailwayProxy } from './railway-proxy';
import { RailwayQueries } from './railway-gql-queries';
import { executeGraphQLQuery } from '../utils/railway-http-client';

vi.mock('../utils/railway-http-client', () => ({
  executeGraphQLQuery: vi.fn(),
}));

vi.mock('../utils/config', () => ({
  getConfig: vi.fn((key: string) => {
    if (key === 'DEPLOY_BUDDY_RAILWAY_PROJECT_ID') {
      return 'project-123';
    }
    if (key === 'RAILWAY_API_URL') {
      return 'https://example.com/graphql';
    }
    if (key === 'RAILWAY_TOKEN') {
      return 'test-token';
    }
    return '';
  }),
}));

const mockedExecute = vi.mocked(executeGraphQLQuery);

describe('RailwayProxy', () => {
  let proxy: RailwayProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    proxy = new RailwayProxy();
  });

  it('calls GET_PROJECT query with the configured project id', async () => {
    mockedExecute.mockResolvedValue({
      data: {
        project: {
          environments: {
            edges: [],
          },
          services: {
            edges: [],
          },
        },
      },
    } as any);

    await proxy.getProjectDetails();

    expect(mockedExecute).toHaveBeenCalledWith(RailwayQueries.GET_PROJECT, {
      projectId: 'project-123',
    });
  });
});

