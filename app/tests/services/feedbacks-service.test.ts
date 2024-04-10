import { Startup } from '@prisma/client';
import { manager2 } from 'mockData/employees';
import { manyFeedbacks, singleFeedback } from 'mockData/feedbacks';
import { prismaMock as db } from 'tests/prisma/client';
import { GetFeedbacksFilters } from 'types/feedback';

describe('the feedbacks service', () => {
  const {
    getFeedbacks,
    getFeedbacksCount,
    updateFeedbackAnswers,
    getPaginatedFeedbacks,
    formatFiltersQuery,
  } = require('services/feedbacks-service');

  const fixedSystemDate = new Date('2022-01-01');
  const fixedEndDate = new Date('2023-08-03');
  const originalDate = Date;

  const filters: GetFeedbacksFilters = {
    dateFrom: fixedSystemDate,
    dateUntil: fixedEndDate,
    startup: [Startup.campus],
    manager: [manager2.id],
  };

  const DateMock = jest.fn().mockReturnValue(() => {
    return fixedSystemDate;
  }) as unknown as DateConstructor;

  const paginateParams = {
    perPage: 1,
    page: 1,
  };

  beforeEach(() => {
    global.Date = DateMock;
  });
  afterAll(() => {
    global.Date = originalDate;
  });

  it('should return a list of all feedbacks', async () => {
    db.feedback.findMany.mockResolvedValue(manyFeedbacks);
    expect(await getFeedbacks()).toEqual(manyFeedbacks);
  });

  it('should return a list of mongodb feedback filters', () => {
    expect(formatFiltersQuery(filters)).toEqual({
      date: {
        gte: fixedSystemDate,
        lte: fixedEndDate,
      },
      employee: {
        startup: { in: [Startup.campus] },
        manager: { id: { in: [manager2.id] } },
      },
    });
  });

  it('should return number total of feedbacks (filtered or not)', async () => {
    db.feedback.count.mockResolvedValue(manyFeedbacks.length);
    expect(await getFeedbacksCount()).toEqual(manyFeedbacks.length);
  });

  it('should return feedbacks list and pagination data', async () => {
    db.feedback.count.mockResolvedValue(manyFeedbacks.length);
    db.feedback.findMany.mockResolvedValue(manyFeedbacks);
    const expectedResult = {
      ...paginateParams,
      totalCount: manyFeedbacks.length,
      feedbacks: manyFeedbacks,
    };
    expect(await getPaginatedFeedbacks(paginateParams)).toEqual(expectedResult);
  });

  it('should update a feedback', async () => {
    db.feedback.update.mockResolvedValue(singleFeedback);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, employee, id, answers, ...data } = singleFeedback;

    expect(await updateFeedbackAnswers(id, { ...data, answers }, manager2)).toEqual(singleFeedback);
    expect(db.feedback.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        ...data,
        date: new Date(data.date),
        answers: { update: answers },
        updatedBy: manager2.id,
      },
    });
  });
});
