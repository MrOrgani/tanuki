import { accountManager2 } from 'mockData/employees';
import { prismaMock as db } from 'tests/prisma/client';
import { manyUsers } from 'mockData/users';
import { getUserByEmail, checkUserAndCreate } from 'services/users-service';
import { RoleType } from '@prisma/client';

describe('the user service', () => {
  describe('User retrieve and update process', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should resolve with user data found', async () => {
      db.user.findFirst.mockResolvedValue(manyUsers[0]);
      expect(await getUserByEmail(manyUsers[0].email)).toEqual(manyUsers[0]);
      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: manyUsers[0].email,
        },
      });
    });
    it('should resolve with null if no user was found', async () => {
      db.user.findFirst.mockResolvedValue(null);
      expect(await getUserByEmail(manyUsers[0].email)).toEqual(null);
    });
    it('should update the user data if user data not found but employee data found', async () => {
      db.employee.findUnique.mockResolvedValue(accountManager2);
      db.user.findFirst.mockResolvedValue(null);
      const userValue = {
        id: accountManager2.email,
        email: accountManager2.email,
        name: accountManager2.name,
        pictureURL: accountManager2.pictureURL,
        role: RoleType.admin,
      };
      db.user.create.mockResolvedValue(userValue);
      expect(await checkUserAndCreate(accountManager2.email)).toEqual(userValue);
    });
    it('should resolve with null if user is not found in user and employee collections', async () => {
      db.employee.findUnique.mockResolvedValue(null);
      db.user.findFirst.mockResolvedValue(null);
      expect(await checkUserAndCreate(manyUsers[1].email)).toEqual(null);
    });
  });
});
