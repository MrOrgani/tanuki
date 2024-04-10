import { Feedback } from '@prisma/client';
import {
  consultant,
  consultant2,
  consultant3,
  manager,
  manager2,
  manager3,
} from 'mockData/employees';
import { manyFeedbacks } from 'mockData/feedbacks';
import { prismaMock as db } from 'tests/prisma/client';
import {
  EmployeesExportType,
  EmployeeWithFeedbacks,
  EMPLOYEE_TYPE,
  EMPLOYEE_TYPE_MAPPING,
  GetEmployeesExportFilters,
} from 'types/employee';
import { MAIN_ENTITIES } from 'utils/constants';

describe('The Export service', () => {
  const service = require('services/export-service') as typeof import('services/export-service');

  describe('getEmployeeExportResults function', () => {
    const filters: GetEmployeesExportFilters = {
      type: EmployeesExportType.Managers,
      userId: 'user-id',
      start: new Date('2020-01-01'),
      end: new Date('2030-01-31'),
    };

    const managersWithFeedbacks: EmployeeWithFeedbacks[] = [
      { ...manager, feedbacks: manyFeedbacks },
      { ...manager2, feedbacks: manyFeedbacks },
      { ...manager3, feedbacks: manyFeedbacks },
    ];

    const consultantsWithFeedbacks: EmployeeWithFeedbacks[] = [
      { ...consultant, feedbacks: manyFeedbacks },
      { ...consultant2, feedbacks: manyFeedbacks },
      { ...consultant3, feedbacks: manyFeedbacks },
    ];

    it('should return managers with their average feedbacks', async () => {
      db.employee.findMany.mockResolvedValueOnce(managersWithFeedbacks);

      const result = await service.getEmployeeExportResults({
        ...filters,
        type: EmployeesExportType.Managers,
      });
      expect(result).toEqual([
        { name: 'Scott Johnson', average: '6,2' },
        { name: 'Emily Barnes', average: '6,2' },
        { name: 'Billy Damone', average: '6,2' },
      ]);
    });

    it('should return consultants with their average feedbacks', async () => {
      db.employee.findMany.mockResolvedValueOnce(consultantsWithFeedbacks);

      const result = await service.getEmployeeExportResults({
        ...filters,
        type: EmployeesExportType.Consultants,
      });

      expect(result).toEqual([
        { name: 'John Doe', average: '6,2' },
        { name: 'Elliot Alderson', average: '6,2' },
        { name: 'Théo Laterre', average: '6,2' },
      ]);
    });

    it('should return some user managees with their average feedbacks', async () => {
      db.employee.findMany.mockResolvedValueOnce(consultantsWithFeedbacks);

      const result = await service.getEmployeeExportResults({
        ...filters,
        type: EmployeesExportType.Managees,
      });

      expect(result).toEqual([
        { name: 'John Doe', average: '6,2' },
        { name: 'Elliot Alderson', average: '6,2' },
        { name: 'Théo Laterre', average: '6,2' },
      ]);
    });

    it('should return null average for every row when filtering by out of range period', async () => {
      db.employee.findMany.mockResolvedValueOnce(managersWithFeedbacks);

      const result = await service.getEmployeeExportResults({
        ...filters,
        type: EmployeesExportType.Managers,
        start: new Date('2010-01-01'),
        end: new Date('2010-01-31'),
      });

      expect(result).toEqual([
        { name: 'Scott Johnson', average: null },
        { name: 'Emily Barnes', average: null },
        { name: 'Billy Damone', average: null },
      ]);
    });
  });

  describe('getEmployeesWithFeedbacks function', () => {
    const filters: GetEmployeesExportFilters = {
      type: EmployeesExportType.Managers,
      userId: 'user-id',
      start: new Date('2020-01-01'),
      end: new Date('2030-01-31'),
    };

    it('should provide a position filter in prisma query when fetching managers', async () => {
      db.employee.findMany.mockResolvedValueOnce([]);
      await service.getEmployeesWithFeedbacks({ ...filters, type: EmployeesExportType.Managers });
      expect(db.employee.findMany).toHaveBeenCalledWith({
        where: {
          startup: { in: MAIN_ENTITIES },
          position: { in: EMPLOYEE_TYPE_MAPPING[EMPLOYEE_TYPE.MANAGER] },
          OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.start } }],
        },
        include: { feedbacks: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should provide a position filter in prisma query when fetching consultants', async () => {
      db.employee.findMany.mockResolvedValueOnce([]);
      await service.getEmployeesWithFeedbacks({
        ...filters,
        type: EmployeesExportType.Consultants,
      });
      expect(db.employee.findMany).toHaveBeenCalledWith({
        where: {
          startup: { in: MAIN_ENTITIES },
          position: { notIn: EMPLOYEE_TYPE_MAPPING[EMPLOYEE_TYPE.MANAGER] },
          OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.start } }],
        },
        include: { feedbacks: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should provide a managerId filter in prisma query when fetching managees', async () => {
      db.employee.findMany.mockResolvedValueOnce([]);
      await service.getEmployeesWithFeedbacks({ ...filters, type: EmployeesExportType.Managees });
      expect(db.employee.findMany).toHaveBeenCalledWith({
        where: {
          id: { not: filters.userId },
          managerId: filters.userId,
          startup: { in: MAIN_ENTITIES },
          OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.start } }],
        },
        include: { feedbacks: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('formatAverage function', () => {
    it('should convert the number to a string', () => {
      expect(service.formatAverage(1)).toEqual('1');
    });

    it('should round by 1 decimal place', () => {
      expect(service.formatAverage(1.12345)).toEqual('1,1');
    });

    it('should return no decimal when the number is equivalent to an integer', () => {
      expect(service.formatAverage(2.0)).toEqual('2');
    });
  });

  describe('computeFeedbacksAverage function', () => {
    it('should calculate the average of given feedbacks', () => {
      const feedbacks = [
        { answers: { grade: 1 } },
        { answers: { grade: 2 } },
        { answers: { grade: 3 } },
      ] as Feedback[];

      expect(service.computeFeedbacksAverage(feedbacks)).toEqual(2);
    });

    it('should return null when providing empty array', () => {
      expect(service.computeFeedbacksAverage([])).toEqual(null);
    });
  });

  describe('filterFeedbacksByPeriod function', () => {
    it('should return the exact same array when the feedbacks are in range', () => {
      const feedbacks = [
        { date: new Date('2021-01-01') },
        { date: new Date('2021-01-02') },
        { date: new Date('2021-01-03') },
      ] as Feedback[];
      const period = { start: new Date('2021-01-01'), end: new Date('2021-01-03') };

      expect(service.filterFeedbacksByPeriod(feedbacks, period)).toStrictEqual(feedbacks);
    });

    it('should omit out of range feedbacks', () => {
      const feedbacks = [
        { date: new Date('2021-01-01') },
        { date: new Date('2021-01-02') },
        { date: new Date('2021-01-03') },
        { date: new Date('2021-01-04') },
      ] as Feedback[];
      const period = { start: new Date('2021-01-02'), end: new Date('2021-01-03') };

      const result = service.filterFeedbacksByPeriod(feedbacks, period);

      expect(result).toHaveLength(2);
      expect(result).toStrictEqual([
        { date: new Date('2021-01-02') },
        { date: new Date('2021-01-03') },
      ]);
    });
  });
});
