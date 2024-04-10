import { Client, CreateClientData } from 'types/client';
import { manyClients } from 'mockData/clients';
import { prismaMock as db } from 'tests/prisma/client';
import { accountManager } from 'mockData/employees';
import { createClient } from 'services/clients-service';

afterEach(() => {
  jest.clearAllMocks();
});

describe('the getClients function', () => {
  const { getClients } = require('services/clients-service');
  it("should return an empty array if search didn't match anything", async () => {
    db.client.findMany.mockResolvedValue([]);
    expect(await getClients()).toEqual([]);
    expect(db.client.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({ where: expect.any })
    );
  });

  it('should return a list of clients with basic information', async () => {
    db.client.findMany.mockResolvedValue(manyClients);
    expect(await getClients()).toEqual(manyClients);
    expect(db.client.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({ where: expect.any })
    );
  });
});

describe('The Create Client function', () => {
  const newClient: Client = {
    id: 'johndoe@email.com',
    name: 'John Doe',
    email: 'johndoe@email.com',
    accountId: 'account-1',
    details: '',
    date: null,
    account: {
      id: 'account-1',
      name: 'Dell',
      accountManagerId: accountManager.email,
      accountManager,
    },
  };
  it('should create a client with an existing account', async () => {
    db.client.create.mockResolvedValue(newClient);

    const clientToCreate: CreateClientData = {
      name: newClient.name,
      email: newClient.email,
      accountId: newClient.accountId,
    };

    expect(await createClient(clientToCreate)).toEqual(newClient);
    expect(db.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: clientToCreate.name,
          email: clientToCreate.email,
          accountId: newClient.accountId,
        },
      })
    );
  });

  it('should create a client and a new account when providing new account information', async () => {
    db.client.create.mockResolvedValue(newClient);

    const clientToCreate: CreateClientData = {
      name: newClient.name,
      email: newClient.email,
      accountData: {
        name: 'Dell',
        accountManagerId: 'amel@dell.fr',
      },
    };

    expect(await createClient(clientToCreate)).toEqual(newClient);

    expect(db.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: clientToCreate.name,
          email: clientToCreate.email,
          account: {
            create: {
              accountManagerId: clientToCreate.accountData?.accountManagerId,
              name: clientToCreate.accountData?.name,
            },
          },
        },
      })
    );
  });
});

export {};
