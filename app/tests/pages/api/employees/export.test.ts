import { testApiHandler } from 'next-test-api-route-handler';
import { adminUser } from 'mockData/users';
import { Blob } from 'buffer';
import { responsePatcherWithUser } from 'tests/test-utils';
import { manager, manager2, manager3 } from 'mockData/employees';
import { EmployeesExportType, EmployeeWithFeedbacks } from 'types/employee';
import { manyFeedbacks } from 'mockData/feedbacks';

const mockService = {
  ...(jest.requireActual('services/export-service') as typeof import('services/export-service')),
  getEmployeesWithFeedbacks: jest.fn(),
  getEmployeeExportResults: jest.fn(),
  countAllConsultants: jest.fn(),
};

jest.mock('services/export-service', () => mockService);

describe('the employees export API', () => {
  const handler = require('pages/api/employees/export')
    .default as typeof import('pages/api/employees/export').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 status error code if method is not POST', async () => {
    await testApiHandler({
      handler,
      responsePatcher: responsePatcherWithUser(adminUser),
      url: `/api/employees/export`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toEqual(405);
      },
    });
  });

  describe('POST endpoint (download)', () => {
    const managersWithFeedbacks: EmployeeWithFeedbacks[] = [
      { ...manager, feedbacks: manyFeedbacks },
      { ...manager2, feedbacks: manyFeedbacks },
      { ...manager3, feedbacks: manyFeedbacks },
    ];

    it('should return 400 when some of the required body params is missing', async () => {
      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2020-01-01',
              type: EmployeesExportType.Managers,
            }),
          });

          const data = await res.json();
          expect(res.status).toEqual(400);
          expect(data.error.message).toMatch(/Invalid parameter for the export file generation/);
        },
      });
    });

    it('should return 400 when body param "type" is not valid', async () => {
      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2020-01-01',
              end: '2020-01-01',
              type: 'invalid_type',
            }),
          });

          const data = await res.json();
          expect(res.status).toEqual(400);
          expect(data.error.message).toMatch(/Invalid parameter for the export file generation/);
        },
      });
    });

    it('should return 500 when an unexpected error happen during csv generation', async () => {
      mockService.getEmployeeExportResults.mockRejectedValue('error');
      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2020-01-01',
              end: '2020-01-01',
              type: EmployeesExportType.Managers,
            }),
          });

          const data = await res.json();
          expect(res.status).toEqual(500);
          expect(data.error.message).toEqual(
            'An unexpected error occured while generating the export file'
          );
        },
      });
    });

    it('should have "employees-export" as csv filename', async () => {
      mockService.getEmployeeExportResults.mockResolvedValueOnce(managersWithFeedbacks);
      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2022-02-01',
              end: '2022-07-31',
              type: EmployeesExportType.Managers,
            }),
          });
          expect((res.headers as Headers).get('Content-Type')).toEqual('text/csv');
          expect((res.headers as Headers).get('Content-Disposition')).toMatch(
            /filename=\"employees-export.csv\"/
          );
        },
      });
    });

    it('should have a pre-defined set of header in the csv content', async () => {
      mockService.getEmployeeExportResults.mockResolvedValueOnce(managersWithFeedbacks);

      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2020-01-01',
              end: '2020-01-01',
              type: EmployeesExportType.Managers,
            }),
          });

          const blob: Blob = await res.blob();
          const content = await blob.text();

          expect(content).toContain('Hubvisor;NPS moyen');
        },
      });
    });

    it('should return a csv with multiple row', async () => {
      mockService.getEmployeeExportResults.mockResolvedValueOnce(managersWithFeedbacks);

      await testApiHandler({
        responsePatcher: responsePatcherWithUser(adminUser),
        handler,
        url: '/api/employees/export',
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: '2020-01-01',
              end: '2020-01-01',
              type: EmployeesExportType.Managers,
            }),
          });

          const blob: Blob = await res.blob();
          const content = await blob.text();

          expect(content.split('\n').length - 1).toEqual(managersWithFeedbacks.length);
        },
      });
    });
  });
});
