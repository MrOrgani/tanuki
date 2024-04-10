import { Feedback, Prisma, RoleType, User } from '@prisma/client';
import ApplicationError from 'errors/ApplicationError';
import db from 'prisma/client';
import { ErrorCode } from 'types/errors';
import {
  CreateOrUpdateFeedbackData,
  FullFeedback,
  GetFeedbacksFilters,
  FeedbackSortableField,
  PaginatedFeedbacks,
  GetOldestFeedbackFilters,
} from 'types/feedback';
import { Pagination } from 'types/table';

const _RELATION_INCUSION = {
  include: {
    employee: true,
    client: {
      include: { account: true },
    },
  },
};

export async function createFeedback(
  feedbackData: CreateOrUpdateFeedbackData,
  user: User
): Promise<Feedback> {
  const createdFeedback = await db.feedback.create({
    data: {
      ...feedbackData,
      date: new Date(feedbackData.date),
      createdBy: user.id,
    },
  });

  return createdFeedback;
}

export async function updateFeedbackAnswers(
  id: string,
  feedbackData: CreateOrUpdateFeedbackData,
  user: User
): Promise<Feedback> {
  const { answers, ...data } = feedbackData;

  return db.feedback.update({
    where: { id },
    data: {
      ...data,
      date: new Date(data.date),
      answers: { update: answers },
      updatedBy: user.id,
    },
  });
}

export async function getPaginatedFeedbacks(
  pagination: Pagination = { perPage: 10, page: 1 },
  filters: GetFeedbacksFilters = {},
  orderBy: FeedbackSortableField = FeedbackSortableField._date
): Promise<PaginatedFeedbacks> {
  const totalCount = await getFeedbacksCount(filters);
  const feedbacks = await getFeedbacks(filters, orderBy, {
    skip: pagination.perPage * (pagination.page - 1),
    take: pagination.perPage,
  });
  return { page: pagination.page, perPage: pagination.perPage, totalCount, feedbacks };
}

export async function getFeedbacks(
  filters: GetFeedbacksFilters = {},
  orderBy: FeedbackSortableField = FeedbackSortableField._date,
  pagination: { skip?: number; take?: number } = {}
): Promise<FullFeedback[]> {
  return db.feedback.findMany({
    ...pagination,
    where: formatFiltersQuery(filters),
    orderBy: chooseSort(orderBy),
    ..._RELATION_INCUSION,
  });
}

export async function getFeedbacksCount(filters: GetFeedbacksFilters = {}): Promise<number> {
  return db.feedback.count({
    where: formatFiltersQuery(filters),
  });
}

export async function getFeedbackById(id: string): Promise<FullFeedback | null> {
  return db.feedback.findFirst({
    where: {
      id,
    },
    ..._RELATION_INCUSION,
  });
}

export function getFeedbackFiltersByRole(user: User): GetFeedbacksFilters {
  if (user.role === RoleType.manager) {
    return { manager: [user.id] };
  }

  return {};
}

function chooseSort(
  field: FeedbackSortableField
): Prisma.Enumerable<Prisma.FeedbackOrderByWithRelationInput> {
  const sort = field[0] === '-' ? 'desc' : 'asc';
  const targetField = sort === 'desc' ? field.slice(1) : field;

  switch (targetField) {
    case FeedbackSortableField.employee:
      return { employee: { name: sort } };
    case FeedbackSortableField.manager:
      return { employee: { manager: { name: sort } } };
    case FeedbackSortableField.client:
      return { client: { name: sort } };
    case FeedbackSortableField.account:
      return { client: { account: { name: sort } } };
    case FeedbackSortableField.score:
      return { answers: { grade: sort } };
    case FeedbackSortableField.date:
      return { date: sort };
    default:
      return { date: 'desc' };
  }
}

export function formatFiltersQuery(filters: GetFeedbacksFilters = {}): Prisma.FeedbackWhereInput {
  // We need to set the latest time of the day here for comparison accuracy purpose
  filters.dateUntil && filters.dateUntil.setHours(23, 59, 59, 999);

  return {
    ...(filters.dateFrom || filters.dateUntil
      ? {
          date: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateUntil ? { lte: filters.dateUntil } : {}),
          },
        }
      : {}),
    employee: {
      ...(filters.employee
        ? {
            OR: [
              { name: { contains: filters.employee, mode: 'insensitive' } },
              { email: { contains: filters.employee, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters.startup ? { startup: { in: filters.startup } } : {}),
      ...(filters.manager ? { manager: { id: { in: filters.manager } } } : {}),
    },
  };
}

export async function getEmployeeFeedbackIndex(feedbackId: string, employeeId: string) {
  const feedbacks = await db.feedback.findMany({
    select: { id: true },
    where: { employeeId },
    orderBy: { date: 'asc' },
  });

  const index = feedbacks.map(feedback => feedback.id).indexOf(feedbackId);

  if (index === -1) {
    throw new ApplicationError(ErrorCode.NOT_FOUND, 'The feedback does not exist');
  }

  return index + 1;
}

export async function deleteFeedback(id: string): Promise<Feedback> {
  const feedback = await db.feedback.findUnique({ where: { id } });
  if (!feedback) {
    throw new ApplicationError(ErrorCode.NOT_FOUND, 'The feedback does not exist');
  }

  // extract the feedback id to avoid any id conflicts in the archive collection
  const { id: _id, ...data } = feedback;
  const [deletedFeedback] = await db.$transaction([
    db.feedback.delete({ where: { id: _id } }),
    db.feedbackArchive.create({ data }),
  ]);

  return deletedFeedback;
}

export async function getOldestFeedback(filters: GetOldestFeedbackFilters = {}) {
  return db.feedback.findFirst({
    where: {
      ...(filters.manager ? { employee: { managerId: filters.manager } } : {}),
    },
    orderBy: { date: 'asc' },
  });
}
