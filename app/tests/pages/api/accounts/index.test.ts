import { testApiHandler } from 'next-test-api-route-handler';
import { manyAccounts } from 'mockData/accounts';

const mockAccountService = {
  getAccounts: jest.fn(),
};

jest.mock('services/accounts-service', () => mockAccountService);

const handler = require('pages/api/accounts');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('the accounts API route handler', () => {
  it('should return a 405 response if method is not GET', async () => {
    await testApiHandler({
      handler,
      url: `api/accounts`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(res.status).toEqual(405);
        expect(await res.text()).toBe('Method POST Not Allowed');
      },
    });
  });

  it('should return 500 response on an unexpected error', async () => {
    mockAccountService.getAccounts.mockRejectedValue(new Error('Database error'));

    await testApiHandler({
      handler,
      url: `api/accounts`,
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toEqual(500);
        expect((await res.json()).message).toEqual('Database error');
      },
    });
  });

  it('should return a list of account', async () => {
    mockAccountService.getAccounts.mockResolvedValue(manyAccounts);

    await testApiHandler({
      handler,
      url: `api/accounts`,
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(await res.json()).toEqual(JSON.parse(JSON.stringify(manyAccounts)));
      },
    });
  });
});
