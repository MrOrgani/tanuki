import { consultant } from 'mockData/employees';
import { prismaMock as db } from 'tests/prisma/client';

describe('The Employees Service', () => {
  const employeeService = require('services/employees-service');

  describe('the getEmployeeByEmail function', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should resolve to null if no employee was found', async () => {
      db.employee.findUnique.mockResolvedValue(null);
      expect(await employeeService.getEmployeeByEmail(consultant.email)).toEqual(null);
      expect(db.employee.findUnique).toHaveBeenCalledWith({
        where: { id: consultant.email },
        include: { manager: true },
      });
    });

    it('should return the employee when the email is found', async () => {
      db.employee.findUnique.mockResolvedValueOnce(consultant);
      expect(await employeeService.getEmployeeByEmail(consultant.email)).toEqual(consultant);
      expect(db.employee.findUnique).toHaveBeenCalledWith({
        where: { id: consultant.email },
        include: { manager: true },
      });
    });
  });
});

export {};
