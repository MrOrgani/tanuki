import { Prisma } from '@prisma/client';

export interface CreateClientData {
  accountId?: string;
  name: string;
  email?: string;
  accountData?: {
    name: string;
    accountManagerId?: string;
  };
  details?: string;
}
export type Client = Prisma.ClientGetPayload<{
  include: { account: { include: { accountManager: true } } };
}>;

export type ClientWithAccount = Prisma.ClientGetPayload<{
  include: { account: true };
}>;

export type SelectableClient = Client & { selected: boolean };
