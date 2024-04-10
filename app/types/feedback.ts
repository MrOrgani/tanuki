import { Employee, Prisma, Startup } from '@prisma/client';
import { FullPagination, Pagination, SortValues } from './table';

export interface CreateOrUpdateFeedbackData {
  clientId: string;
  employeeId: string;
  answers: {
    grade: number;
    positives: string;
    areasOfImprovement: string;
    context: string;
    objectives: string;
    details?: string;
  };
  date: string;
  createdBy: string;
  updatedBy?: string;
}

export type SerializedFeedback = FullFeedback & {
  date: string;
};

export type FullFeedback = Prisma.FeedbackGetPayload<{
  include: {
    employee: true;
    client: {
      include: {
        account: true;
      };
    };
  };
}>;

export interface GetFeedbacksFilters {
  dateFrom?: Date | null;
  dateUntil?: Date | null;
  employee?: string;
  manager?: string[];
  startup?: Startup[];
}

export interface GetOldestFeedbackFilters {
  manager?: Employee['id'];
}

export interface GetFeedbacksSorting {
  field?: string;
  sort?: SortValues;
}

export interface ExportData {
  href: string;
  download: string;
}
export interface FeedbackExportRow {
  name: string;
  grade: number | null;
  account: string;
  client: string;
  manager?: string;
  date: string;
}

export interface PaginatedFeedbacks extends Partial<FullPagination> {
  feedbacks: FullFeedback[];
}

export interface FeedbackRequestQuery {
  filter: GetFeedbacksFilters;
  orderBy?: FeedbackSortableField;
  pagination?: Pagination;
}

export enum FeedbackSortableField {
  manager = 'manager',
  employee = 'employee',
  account = 'account',
  client = 'client',
  date = 'date',
  score = 'score',
  _manager = '-manager',
  _employee = '-employee',
  _account = '-account',
  _client = '-client',
  _date = '-date',
  _score = '-score',
}

export type FeedbackSearchQuery = {
  q?: string;
  sort?: FeedbackSortableField;
  page?: number;
  perPage?: number;
  startup?: Startup[];
  manager?: Employee['id'][];
  start?: string;
  end?: string;
};

export enum FeedbackNpsTag {
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  MODERATE = 'moderate',
  POSITIVE = 'positive',
}
