import { testApiHandler } from 'next-test-api-route-handler';
import { manyFeedbacks, singleFeedback } from 'mockData/feedbacks';
import { Startup } from '@prisma/client';
import { responsePatcher, responsePatcherWithUser } from 'tests/test-utils';
import { managerUser } from 'mockData/users';
import { getCurrentDateString } from 'utils/date';

// Some of the feedback service functions should not be mocked
const feedbackService = jest.requireActual('services/feedbacks-service');
const mockServices = {
  feedback: {
    ...feedbackService,
    getFeedbacks: jest.fn(),
    getPaginatedFeedbacks: jest.fn(),
    createFeedback: jest.fn(),
    updateFeedbackAnswers: jest.fn(),
  },
  client: {
    createClient: jest.fn(),
  },
};

jest.mock('services/feedbacks-service', () => mockServices.feedback);
jest.mock('services/clients-service', () => mockServices.client);

const handler = require('pages/api/feedbacks');

describe('the feedbacks API route handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 405 response if method is not GET, POST or PUT', async () => {
    await testApiHandler({
      handler,
      responsePatcher,
      url: `api/feedbacks`,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        expect(res.status).toEqual(405);
        expect(await res.text()).toBe('Method DELETE Not Allowed');
      },
    });
  });

  describe('GET feedback API route', () => {
    it('should return 500 response on an unexpected error', async () => {
      mockServices.feedback.getFeedbacks.mockRejectedValue(new Error('Database error'));

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(500);
          expect((await res.json()).message).toEqual('Database error');
        },
      });
    });

    it('should return a list of feedback with 200 status code', async () => {
      const expectedValue = { feedbacks: manyFeedbacks };
      mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks);

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    it('should return a list of feedback for the selected page (default page 1) with number pages needed', async () => {
      const mockResult = {
        pageTotal: 2,
        ...manyFeedbacks.slice(0, 1),
      };
      const perPage = 1;
      mockServices.feedback.getPaginatedFeedbacks.mockResolvedValue(mockResult);

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks?paginate=true&perPage=${perPage}`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(mockResult)));
        },
      });
    });
    it('should return list of feedback sorted by field selected (asc & desc)', async () => {
      const expectedValue = { feedbacks: manyFeedbacks };
      mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks);
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks?`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    it('should return list of feedbacks between two dates', async () => {
      const expectedValue = { feedbacks: manyFeedbacks };
      const date = {
        from: '2022-11-01',
        until: '2022-12-30',
      };
      mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks);
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks?from=${date.from}&until=${date.until}`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    it('should return only feedbacks from campus', async () => {
      const expectedValue = { feedbacks: manyFeedbacks[1] };
      mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks[1]);

      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks?startup=${Startup.campus}`,
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.status).toEqual(200);
          expect(await res.json()).toEqual(JSON.parse(JSON.stringify(expectedValue)));
        },
      });
    });

    it('should filter feedbacks automatically by manager if the current user is a manager', async () => {
      mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks[1]);

      await testApiHandler({
        handler,
        responsePatcher: responsePatcherWithUser(managerUser),
        url: `api/feedbacks?sort=date`,
        test: async ({ fetch }) => {
          await fetch();
          expect(mockServices.feedback.getFeedbacks).toHaveBeenCalledWith(
            { manager: [managerUser.id] },
            'date'
          );
        },
      });
    });
  });

  describe('POST feedback API route', () => {
    it('should return 400 when having an empty required field', async () => {
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...singleFeedback,
              employeeId: '',
            }),
          });
          expect(res.status).toEqual(400);
          expect(await res.text()).toEqual(
            'error when creating feedback: "employeeId" is not allowed to be empty'
          );
        },
      });
    });

    it('should return 400 when having a non-valid NPS', async () => {
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...singleFeedback,
              answers: {
                ...singleFeedback.answers,
                grade: 11,
              },
            }),
          });
          expect(res.status).toEqual(400);
          expect(await res.text()).toEqual(
            'error when creating feedback: "answers.grade" must be less than or equal to 10'
          );
        },
      });
    });

    it('should return 400 when having an out of range feedback date', async () => {
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...singleFeedback,
              date: '2020-11-01',
            }),
          });
          expect(res.status).toEqual(400);
          expect(await res.text()).toEqual(
            'error when creating feedback: "date" must be greater than or equal to "2022-02-01T00:00:00.000Z"'
          );
        },
      });
    });
  });

  describe('PUT feedback API route', () => {
    it('should return 204 for a successful update', async () => {
      mockServices.feedback.updateFeedbackAnswers.mockResolvedValue(singleFeedback);
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: singleFeedback.id,
              clientId: singleFeedback.clientId,
              employeeId: singleFeedback.employeeId,
              answers: { ...singleFeedback.answers },
              date: getCurrentDateString(),
              updatedBy: singleFeedback.updatedBy,
            }),
          });
          expect(res.status).toEqual(204);
        },
      });
    });

    it('should return 400 when having a non-valid NPS', async () => {
      await testApiHandler({
        handler,
        responsePatcher,
        url: `api/feedbacks`,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: singleFeedback.id,
              clientId: singleFeedback.clientId,
              employeeId: singleFeedback.employeeId,
              answers: { ...singleFeedback.answers, grade: 11 },
              date: getCurrentDateString(),
              createdBy: singleFeedback.createdBy,
              updatedBy: singleFeedback.updatedBy,
            }),
          });
          expect(res.status).toEqual(400);
          expect(await res.text()).toEqual(
            'error when updating feedback: "answers.grade" must be less than or equal to 10'
          );
        },
      });
    });
  });
});
