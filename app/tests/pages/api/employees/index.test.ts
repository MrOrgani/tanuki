import { testApiHandler } from 'next-test-api-route-handler';

const mockEmployeeService = {
  getEmployees: jest.fn(),
};

jest.mock('services/employees-service.ts', () => mockEmployeeService);

const handler = require('pages/api/employees');

describe('the employees API route handler', () => {
  it('should return a 405 response if method is PUT', async () => {
    await testApiHandler({
      handler,
      url: `api/employees`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(res.status).toEqual(405);
        expect(await res.text()).toBe('Method PUT Not Allowed');
      },
    });
  });
});

describe('the GET employees API route', () => {
  it('should return a 400 response if called with several "query" query parameters', async () => {
    await testApiHandler({
      handler,
      url: `api/employees?query=foo&query=bar`,
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(res.status).toEqual(400);
        expect(await res.text()).toBe('Please specify a single search query');
      },
    });
  });

  it('should return 500 response on an unexpected error', async () => {
    mockEmployeeService.getEmployees.mockRejectedValue(new Error('Database error'));

    await testApiHandler({
      handler,
      url: `api/employees`,
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toEqual(500);
        expect((await res.json()).message).toEqual('Database error');
      },
    });
  });

  it('should return a 200 response if method is GET', async () => {
    await testApiHandler({
      handler: (_, res) => {
        res.send({ oui: 'non' });
      },
      url: `api/employees`,
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(await res.status).toEqual(200);
        await expect(res.json()).resolves.toStrictEqual({ oui: 'non' });
      },
    });
  });
});
