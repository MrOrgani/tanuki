import { prismaMock as db } from 'tests/prisma/client';
import { getAccounts } from 'services/accounts-service';
import { manyAccounts } from 'mockData/accounts';
import { accountManager } from 'mockData/employees';

describe('The Accounts service', () => {
  describe('the getAccounts method', () => {
    describe('when no query or filter are passed', () => {
      it('should return an empty list if no accounts exists in database', async () => {
        db.account.findMany.mockResolvedValue([]);

        expect(await getAccounts()).toEqual([]);
        expect(db.account.findMany).not.toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.any,
          })
        );
      });

      it('should return an unfiltered list of accounts', async () => {
        db.account.findMany.mockResolvedValue(manyAccounts);

        expect(await getAccounts()).toEqual(manyAccounts);
        expect(db.account.findMany).not.toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.any,
          })
        );
      });
    });
    describe('when query or filters are passed', () => {
      const query = 'Company';

      it('should filter accounts on the account name OR the account manager name with the query', async () => {
        db.account.findMany.mockResolvedValue(manyAccounts);
        await getAccounts(query);
        expect(db.account.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                {
                  accountManager: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              ],
            },
          })
        );
      });
      it('should filter with query AND accountManagerId if both are passed', async () => {
        db.account.findMany.mockResolvedValue(manyAccounts);
        await getAccounts(query, accountManager.email);
        expect(db.account.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                {
                  accountManager: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              ],
              accountManagerId: { equals: accountManager.email },
            },
          })
        );
      });
    });
  });
});

export {};
