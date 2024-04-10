import { testApiHandler } from 'next-test-api-route-handler';
import { singleClient } from 'mockData/clients';
import { CreateClientData } from 'types/client';
import { serializeProps } from 'utils/serialize';

const mockClientService = {
  createClient: jest.fn(),
  getClients: jest.fn(),
};

jest.mock('services/clients-service', () => mockClientService);

const handler = require('pages/api/clients');

describe('the clients API route handler', () => {
  it('should return a 405 response if method is PUT', async () => {
    await testApiHandler({
      handler,
      url: `api/clients`,
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

describe('the GET clients API route', () => {
  it('should return a 200 response if method is GET', async () => {
    await testApiHandler({
      handler: (_, res) => {
        res.send({ oui: 'non' });
      },
      url: `api/clients`,
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

  it('should return 500 response on an unexpected error', async () => {
    mockClientService.getClients.mockRejectedValue(new Error('Database error'));

    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toEqual(500);
        expect(await res.json()).toMatchObject({ error: { message: 'Database error' } });
      },
    });
  });
});

describe('the POST clients API route', () => {
  const clientRequestBodyWithNewAccount: CreateClientData = {
    accountData: {
      name: 'companyClient',
      accountManagerId: 'accountManager@email.com',
    },
    name: 'nameClient',
    email: 'mailClient@mail.fr',
    details: '',
  };

  const clientRequestBodyWithAlreadyExistingAccount: CreateClientData = {
    accountId: 'account-1',
    name: 'nameClient',
    email: 'mailClient@mail.fr',
    details: '',
  };

  const clientRequestBodyWithDetails: CreateClientData = {
    accountData: {
      name: 'companyClient',
      accountManagerId: 'accountManager@email.com',
    },
    name: 'nameClient',
    email: 'mailClient@mail.fr',
    details: 'details about the client',
  };

  const invalidClientRequestBodyWithoutAccount: Record<string, unknown> = {
    name: 'Giles Boulet',
    email: 'mailClient@mail.fr',
  };

  const invalidClientRequestBodyWithNameAsNumber: Record<string, unknown> = {
    company: 'companyClient',
    name: 502,
    email: 'mailClient@mail.fr',
  };

  it('should return a 400 response if method is POST without body', async () => {
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(await res.status).toEqual(400);
        expect(await res.json()).toMatchObject({
          error: { message: 'Validation error: "name" is required' },
        });
      },
    });
  });

  it('should return a 400 response if method is POST with a number for client name', async () => {
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidClientRequestBodyWithNameAsNumber),
        });
        expect(await res.status).toEqual(400);
        expect(await res.json()).toMatchObject({
          error: { message: 'Validation error: "name" must be a string' },
        });
      },
    });
  });

  it('should return a 400 response if method is POST with missing accountData or accountId', async () => {
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidClientRequestBodyWithoutAccount),
        });
        expect(await res.status).toEqual(400);
        expect(await res.json()).toMatchObject({
          error: {
            message:
              'Validation error: "value" must contain at least one of [accountId, accountData]',
          },
        });
      },
    });
  });

  it('should return a 201 response if method is POST and body is valid, with account that already exists', async () => {
    mockClientService.createClient.mockResolvedValue(singleClient);
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientRequestBodyWithAlreadyExistingAccount),
        });
        expect(await res.status).toEqual(201);
        await expect(res.json()).resolves.toStrictEqual(serializeProps(singleClient));
      },
    });
  });

  it('should return a 201 response if method is POST and body is valid, with new account to create', async () => {
    mockClientService.createClient.mockResolvedValue(singleClient);
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientRequestBodyWithNewAccount),
        });
        expect(await res.status).toEqual(201);
        await expect(res.json()).resolves.toStrictEqual(serializeProps(singleClient));
      },
    });
  });

  it('should return a 201 response if method is POST and body is valid with a details field', async () => {
    mockClientService.createClient.mockResolvedValue(singleClient);
    await testApiHandler({
      handler,
      url: `api/clients`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientRequestBodyWithDetails),
        });
        expect(await res.status).toEqual(201);
        await expect(res.json()).resolves.toStrictEqual(serializeProps(singleClient));
      },
    });
  });
});
