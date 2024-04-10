import { Employee, Prisma, Startup } from '@prisma/client';
import { FullPagination } from './table';

export type FullEmployee = Prisma.EmployeeGetPayload<{
  include: { manager: true };
}>;

export type ShortEmployee = Pick<Employee, 'id' | 'name' | 'pictureURL'>;

export type EmployeeWithFeedbacks = Prisma.EmployeeGetPayload<{
  include: { feedbacks: true };
}>;

export enum EMPLOYEE_TYPE {
  ACMA = 'ACMA',
  MANAGER = 'manager',
}

export const EMPLOYEE_TYPE_MAPPING: Record<EMPLOYEE_TYPE, string[]> = {
  [EMPLOYEE_TYPE.ACMA]: ['Account Executive', 'Responsable commercial', 'Account Manager'],

  [EMPLOYEE_TYPE.MANAGER]: [
    'Tech Team Manager',
    'Product Team Manager',
    'Design Team Manager',
    'Campus Director',
    'VP',
    'CTO',
  ],
};

export interface GetEmployeesFilters {
  query?: string;
  allowEndDateSince?: Date;
  employeeType?: EMPLOYEE_TYPE;
  omitFormerEmployees?: boolean;
}

export interface AggregationData {
  date: Date | null;
  count: number;
  average: number | null;
}

export type ManageeFeedbacksAggregation = ShortEmployee & AggregationData;
export type ManagerAggregation = ShortEmployee &
  AggregationData & {
    managees: ManageeFeedbacksAggregation[];
  };

export type EmployeeAggregation = ManageeFeedbacksAggregation | ManagerAggregation;

export interface PaginatedManagersAggregation extends FullPagination {
  results: ManagerAggregation[];
}

export type ManagerWithManageesFeedbacks = Prisma.EmployeeGetPayload<{
  select: {
    id: true;
    name: true;
    pictureURL: true;
    contractEndDate: true;
    managees: {
      select: {
        id: true;
        name: true;
        pictureURL: true;
        contractEndDate: true;
        feedbacks: {
          select: {
            date: true;
            answers: {
              select: {
                grade: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type ManagersAggregationSearchQuery = {
  q?: string;
  page?: number;
  perPage?: number;
  startups?: Startup[];
  start?: string;
  end?: string;
  sort?: ManagersAggregationSort;
};

export interface GetManagersAggregationFilters {
  q?: string;
  startups?: Startup[];
  start?: Date;
  end?: Date;
  managers?: string[];
}

export enum ManagersAggregationSort {
  NameAsc = 'name',
  AverageAsc = 'average',
  CountAsc = 'count',
  DateAsc = 'date',
  NameDesc = '-name',
  AverageDesc = '-average',
  CountDesc = '-count',
  DateDesc = '-date',
}

export enum EmployeesExportType {
  Managers = 'managers',
  Consultants = 'consultants',
  Managees = 'managees',
}

export interface GetEmployeesExportFilters {
  userId: string;
  type: EmployeesExportType;
  start: Date;
  end: Date;
}

export interface EmployeeExportRow {
  name: string;
  average: string | null;
}
