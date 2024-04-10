import { testApiHandler } from 'next-test-api-route-handler';
import { managersAggregation, managersWithManageesFeedbacks } from 'mockData/managersAggregation';
import { ManagersAggregationSort, PaginatedManagersAggregation } from 'types/employee';
import { prismaMock as db } from 'tests/prisma/client';
import { Employee } from '@prisma/client';
import { responsePatcher, responsePatcherWithUser } from 'tests/test-utils';
import { managerUser } from 'mockData/users';

const handler = require('pages/api/employees/managers/aggregation');

describe('the aggregation API route handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 405 response if method is not GET', async () => {
    await testApiHandler({
      handler,
      responsePatcher,
      url: `api/employees/managers/aggregation`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST' });
        expect(res.status).toEqual(405);
        expect(await res.text()).toBe('Method POST Not Allowed');
      },
    });
  });

  describe('GET aggregation API route', () => {
    it('should return 500 response on an unexpected error', async () => {
      db.employee.findMany.mockRejectedValue(new Error('Database error'));

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/employees/managers/aggregation`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(500);
          expect((await res.json()).message).toEqual('Database error');
        },
      });
    });

    it('should return a list of aggregated feedback with pagination options', async () => {
      const expectedValue: PaginatedManagersAggregation = {
        page: 1,
        perPage: 10,
        totalCount: managersAggregation.length,
        results: managersAggregation,
      };
      db.employee.findMany.mockResolvedValue(
        managersWithManageesFeedbacks as unknown as Employee[]
      );

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/employees/managers/aggregation`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    it('should return a list of aggregated feedback starting at page 2 with 2 items per page', async () => {
      const expectedValue: PaginatedManagersAggregation = {
        page: 2,
        perPage: 2,
        totalCount: managersAggregation.length,
        results: managersAggregation.slice(2, 4),
      };

      db.employee.findMany.mockResolvedValue(
        managersWithManageesFeedbacks as unknown as Employee[]
      );

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/employees/managers/aggregation?page=2&perPage=2`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    describe('manager context', () => {
      it('should filter automatically by manager if the current user is a manager', async () => {
        db.employee.findMany.mockResolvedValue([]);
        const employeeService = require('services/employees-service');
        const spyGetManagersAggregation = jest.spyOn(employeeService, 'getManagersAggregation');

        await testApiHandler({
          handler,
          responsePatcher: responsePatcherWithUser(managerUser),
          url: `api/employees/managers/aggregation`,
          test: async ({ fetch }) => {
            await fetch();
            expect(spyGetManagersAggregation).toHaveBeenCalledWith(
              { managers: [managerUser.id] },
              { page: 1, perPage: 10 },
              ManagersAggregationSort.NameAsc
            );
          },
        });
      });

      it('should sort by average grade in ascending order', async () => {
        db.employee.findMany.mockResolvedValue([
          managersWithManageesFeedbacks[0],
        ] as unknown as Employee[]);

        await testApiHandler({
          handler,
          responsePatcher: responsePatcherWithUser(managerUser),
          url: `api/employees/managers/aggregation?sort=${ManagersAggregationSort.AverageAsc}`,
          test: async ({ fetch }) => {
            const res = await fetch();
            const value = (await res.json()) as PaginatedManagersAggregation;
            const expected = managersAggregation.find(m => m.id === managerUser.id);

            if (!expected) {
              throw new Error('Expected value not found');
            }

            const sortedManagees = expected.managees.sort((a, b) => {
              if (!a.average) return -1;
              if (!b.average) return 1;

              return a.average - b.average;
            });

            expect(res.status).toEqual(200);
            expect(value.results[0].managees).toEqual(JSON.parse(JSON.stringify(sortedManagees)));
          },
        });
      });

      it('should sort by average grade in descending order', async () => {
        db.employee.findMany.mockResolvedValue([
          managersWithManageesFeedbacks[0],
        ] as unknown as Employee[]);

        await testApiHandler({
          handler,
          responsePatcher: responsePatcherWithUser(managerUser),
          url: `api/employees/managers/aggregation?sort${ManagersAggregationSort.AverageDesc}`,
          test: async ({ fetch }) => {
            const res = await fetch();
            const value = (await res.json()) as PaginatedManagersAggregation;
            const expected = managersAggregation.find(m => m.id === managerUser.id);

            if (!expected) {
              throw new Error('Expected value not found');
            }

            const sortedManagees = expected.managees.sort((a, b) => {
              if (!b.average) return -1;
              if (!a.average) return 1;

              return b.average - a.average;
            });

            expect(res.status).toEqual(200);
            expect(value.results[0].managees).toEqual(JSON.parse(JSON.stringify(sortedManagees)));
          },
        });
      });
    });
  });
});
