import handler from 'pages/api/feedbacks/export';
import { testApiHandler } from 'next-test-api-route-handler';
import { manyFeedbacks } from 'mockData/feedbacks';
import { managerUser } from 'mockData/users';
import { Blob } from 'buffer';
import { ServerResponse } from 'http';
import { User } from '@prisma/client';
import { responsePatcher } from 'tests/test-utils';

interface Response extends ServerResponse {
  locals?: {
    user: User;
  };
}

const mockGetFeedbacks = jest.fn();
const mockGetFeedbackExportResults = jest.fn();
jest.mock('services/feedbacks-service', () => {
  const originalModule = [
    jest.requireActual('services/feedbacks-service'),
    jest.requireActual('services/export-service'),
  ];

  return {
    ...originalModule,
    getFeedbacks: () => mockGetFeedbacks(),
    mockGetFeedbackExportResults: () => mockGetFeedbackExportResults(),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('the feedbacks export API', () => {
  it('should return 405 status error code if method is not POST', async () => {
    await testApiHandler({
      responsePatcher,
      handler,
      url: `/api/feedbacks/export`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
        });
        expect(res.status).toEqual(405);
      },
    });
  });

  it('should return 403 status code when the users has not admin role', async () => {
    mockGetFeedbacks.mockResolvedValue([]);
    await testApiHandler({
      responsePatcher: (res: Response) => {
        res.locals = {
          user: managerUser,
        };
      },
      handler,
      url: `/api/feedbacks/export`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(res.status).toEqual(403);
      },
    });
  });

  it('should only return CSV Headers when no feedback has been found for a given period', async () => {
    mockGetFeedbacks.mockResolvedValue([]);
    await testApiHandler({
      responsePatcher,
      handler,
      url: `/api/feedbacks/export`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start: '2020-02-01',
            end: '2020-07-31',
          }),
        });
        expect(res.status).toEqual(200);
        const blob: Blob = await res.blob();
        const content = await blob.text();

        expect(content).toContain('Hubvisor;NPS;Compte;Interlocuteur;HOT;Date du feedback');
      },
    });
  });

  it('should have a content-type and content-disposition headers', async () => {
    mockGetFeedbacks.mockResolvedValue(manyFeedbacks);
    await testApiHandler({
      responsePatcher: responsePatcher,
      handler,
      url: '/api/feedbacks/export',
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: '2022-02-01',
            end: '2022-07-31',
          }),
        });
        expect((res.headers as Headers).get('Content-Type')).toEqual('text/csv');
        expect((res.headers as Headers).get('Content-Disposition')).toEqual(
          'attachment; filename="feedbacks-export.csv"'
        );
      },
    });
  });

  it('should have a pre-defined set of header in the csv content', async () => {
    mockGetFeedbacks.mockResolvedValue(manyFeedbacks);

    await testApiHandler({
      responsePatcher,
      handler,
      url: `/api/feedbacks/export`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start: '2022-02-01',
            end: '2022-07-31',
          }),
        });

        const blob: Blob = await res.blob();
        const content = await blob.text();

        expect(content).toContain('Hubvisor;NPS;Compte;Interlocuteur;HOT;Date du feedback');
      },
    });
  });
});
