import db from 'prisma/client';
import { AccountWithACMA } from 'types/account';

const DEFAULT_ACCOUNT_RELATIONS_INCLUSION = {
  include: {
    accountManager: true,
  },
};

export async function getAccounts(
  query?: string,
  accountManagerId?: string
): Promise<AccountWithACMA[]> {
  const accounts = await db.account.findMany({
    where: {
      ...(query && query.length > 0
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              {
                accountManager: {
                  name: { contains: query, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
      ...(accountManagerId
        ? {
            accountManagerId: { equals: accountManagerId },
          }
        : {}),
    },
    orderBy: {
      name: 'asc',
    },
    ...DEFAULT_ACCOUNT_RELATIONS_INCLUSION,
  });

  // Additional case insensitive sorting that Prisma cannot handle
  return accounts.sort((a, b) => a.name.localeCompare(b.name));
}
