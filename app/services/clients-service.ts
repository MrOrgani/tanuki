import { CreateClientData, Client } from 'types/client';
import db from 'prisma/client';
import ApplicationError from 'errors/ApplicationError';
import { ErrorCode } from 'types/errors';

const DEFAULT_CLIENT_RELATIONS_INCLUSION = {
  include: {
    account: {
      include: {
        accountManager: true,
      },
    },
  },
};
export async function createClient(clientCreationData: CreateClientData): Promise<Client> {
  const staticFields = {
    name: clientCreationData.name,
    email: clientCreationData.email,
    ...(clientCreationData.details ? { details: clientCreationData.details } : {}),
  };

  if (clientCreationData.accountId) {
    // Checking if the name/email already exists for the selected account
    const foundClient = await db.client.findFirst({
      where: {
        accountId: clientCreationData.accountId,
        ...(staticFields.email?.trim()
          ? {
              OR: [
                { name: { equals: staticFields.name, mode: 'insensitive' } },
                { email: { equals: staticFields.email, mode: 'insensitive' } },
              ],
            }
          : { name: { equals: staticFields.name, mode: 'insensitive' } }),
      },
    });

    if (foundClient) {
      throw new ApplicationError(
        ErrorCode.BAD_REQUEST,
        'Validation error: this client name or email already exists for the selected account'
      );
    }

    return db.client.create({
      data: {
        ...staticFields,
        accountId: clientCreationData.accountId,
      },
      ...DEFAULT_CLIENT_RELATIONS_INCLUSION,
    });
  }
  if (clientCreationData.accountData) {
    return db.client.create({
      data: {
        ...staticFields,
        account: {
          create: {
            ...(clientCreationData.accountData.accountManagerId
              ? { accountManagerId: clientCreationData.accountData.accountManagerId }
              : {}),
            name: clientCreationData.accountData.name,
          },
        },
      },
      ...DEFAULT_CLIENT_RELATIONS_INCLUSION,
    });
  }

  throw new Error('Cannot create a new client without an accountId or accountData');
}

export async function getClients(): Promise<Client[]> {
  const clients = await db.client.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      account: {
        include: {
          accountManager: true,
        },
      },
    },
  });

  // Additional case insensitive sorting that Prisma cannot handle
  return clients.sort((a, b) => a.name.localeCompare(b.name));
}
