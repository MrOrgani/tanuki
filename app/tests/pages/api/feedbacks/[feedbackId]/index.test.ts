import { testApiHandler } from 'next-test-api-route-handler';
import { responsePatcher } from 'tests/test-utils';
import ApplicationError from 'errors/ApplicationError';
import { ErrorCode } from 'types/errors';

const mockServices = {
  feedback: {
    deleteFeedback: jest.fn(),
  },
};

jest.mock('services/feedbacks-service', () => mockServices.feedback);

describe('the feedback with id param API', () => {
  const handler = require('pages/api/feedbacks/[feedbackId]/index').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 status error code if method is not DELETE', async () => {
    await testApiHandler({
      responsePatcher,
      handler,
      url: `api/feedbacks/1`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toEqual(405);
      },
    });
  });

  it('should return 404 status when the provided id param is not found', async () => {
    mockServices.feedback.deleteFeedback.mockRejectedValue(
      new ApplicationError(ErrorCode.NOT_FOUND, 'Feedback not found')
    );

    await testApiHandler({
      responsePatcher,
      handler,
      url: `api/feedbacks/1`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' });
        const json = await res.json();
        expect(res.status).toEqual(404);
        expect(json).toStrictEqual({
          error: { status: 404, message: 'Feedback not found' },
        });
      },
    });
  });

  it('should return 500 status when an unexpected error occured', async () => {
    mockServices.feedback.deleteFeedback.mockRejectedValue(new Error());

    await testApiHandler({
      responsePatcher,
      handler,
      url: `api/feedbacks/1`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' });
        const json = await res.json();
        expect(res.status).toEqual(500);
        expect(json).toStrictEqual({
          error: { status: 500, message: 'Error when deleting feedback' },
        });
      },
    });
  });

  it('should return 204 status when the feedback has been deleted', async () => {
    mockServices.feedback.deleteFeedback.mockResolvedValue(true);

    await testApiHandler({
      responsePatcher,
      handler,
      url: `api/feedbacks/1`,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'DELETE' });
        expect(res.status).toEqual(204);
      },
    });
  });
});
