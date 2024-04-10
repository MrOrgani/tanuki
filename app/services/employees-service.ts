import db from '../prisma/client';
import { Employee } from '@prisma/client';
import {
  ManageeFeedbacksAggregation,
  EMPLOYEE_TYPE,
  EMPLOYEE_TYPE_MAPPING,
  GetEmployeesFilters,
  AggregationData,
  ManagerAggregation,
  ManagerWithManageesFeedbacks,
  PaginatedManagersAggregation,
  GetManagersAggregationFilters,
  ManagersAggregationSort,
  EmployeeAggregation,
  FullEmployee,
} from '../types/employee';
import { Pagination } from 'types/table';
import { DateInterval } from 'types/date';

export async function getEmployees(filters: GetEmployeesFilters = {}): Promise<Employee[]> {
  return db.employee.findMany({
    where: {
      ...(filters.query && filters.query.length
        ? {
            OR: [
              { name: { contains: filters.query, mode: 'insensitive' } },
              { email: { contains: filters.query, mode: 'insensitive' } },
            ], // TODO use fulltextsearch once prisma supports it for mongo
          }
        : {}),

      ...(filters.employeeType
        ? {
            position: {
              in: EMPLOYEE_TYPE_MAPPING[filters.employeeType],
              mode: 'insensitive',
            },
          }
        : {}),

      ...(filters.allowEndDateSince
        ? {
            OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.allowEndDateSince } }],
          }
        : {}),
      ...(filters.omitFormerEmployees ? { contractEndDate: null } : {}),
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getManagers(options: GetEmployeesFilters = {}) {
  return getEmployees({ ...options, employeeType: EMPLOYEE_TYPE.MANAGER });
}

export async function getACMAs(options: GetEmployeesFilters = {}) {
  return getEmployees({ ...options, employeeType: EMPLOYEE_TYPE.ACMA });
}

export async function getEmployeeByEmail(email: string): Promise<FullEmployee | null> {
  return db.employee.findUnique({
    where: { id: email },
    include: { manager: true },
  });
}

export async function getEmployeeManager(email: string): Promise<FullEmployee | null> {
  return db.employee.findUnique({
    where: { id: email },
    include: { manager: true },
  });
}

export async function getManagersWithManagees(
  filters: GetManagersAggregationFilters = {}
): Promise<ManagerWithManageesFeedbacks[]> {
  const formerEmployeeFilter = filters.start
    ? { OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.start } }] }
    : { contractEndDate: null };

  return db.employee.findMany({
    where: {
      position: {
        in: EMPLOYEE_TYPE_MAPPING[EMPLOYEE_TYPE.MANAGER],
        mode: 'insensitive',
      },
      ...formerEmployeeFilter,
      ...(filters.managers && filters.managers.length ? { id: { in: filters.managers } } : {}),
      ...(filters.startups ? { startup: { in: filters.startups } } : {}),
      ...(filters.q ? { name: { contains: filters.q, mode: 'insensitive' } } : {}),
    },
    select: {
      id: true,
      name: true,
      pictureURL: true,
      contractEndDate: true,
      managees: {
        select: {
          id: true,
          name: true,
          pictureURL: true,
          contractEndDate: true,
          feedbacks: {
            select: {
              date: true,
              answers: {
                select: {
                  grade: true,
                },
              },
            },
          },
        },
        where: { ...formerEmployeeFilter },
      },
    },
  });
}

const getManageesAggregation = (
  managees: ManagerWithManageesFeedbacks['managees'],
  dateInterval?: DateInterval
): ManageeFeedbacksAggregation[] => {
  const hasDateFilter = dateInterval && dateInterval.start && dateInterval.end;
  dateInterval?.end?.setHours(23, 59, 59, 999);
  return managees.map<ManageeFeedbacksAggregation>(managee => {
    const aggregatedData = managee.feedbacks.reduce(
      (previous, feedback) => {
        const isDateInRange =
          !hasDateFilter ||
          (feedback.date >= dateInterval?.start && feedback.date <= dateInterval?.end);

        if (!isDateInRange) {
          return previous;
        }

        const isMaxDate = !previous.date || feedback.date > previous.date;

        return {
          count: previous.count + 1,
          date: isMaxDate ? feedback.date : previous.date,
          average: previous.average
            ? (previous.average * previous.count + feedback.answers.grade) / (previous.count + 1)
            : feedback.answers.grade,
        };
      },
      {
        date: null,
        count: 0,
        average: null,
      } as AggregationData
    );

    return {
      id: managee.id,
      name: managee.name,
      pictureURL: managee.pictureURL,
      ...aggregatedData,
    };
  });
};

const getManagerAggregation = (managees: ManageeFeedbacksAggregation[]): AggregationData => {
  let averageCount = 0;
  return managees.reduce(
    (acc, managee) => {
      if (!managee.count) {
        return acc;
      }

      if (!acc.count) {
        return {
          date: managee.date,
          count: managee.count,
          average: managee.average,
        };
      }

      const copyAcc = { ...acc };

      // Calculate average continuously and ommit null values
      if (managee.average && copyAcc.average) {
        averageCount += averageCount ? managee.count : copyAcc.count + managee.count;
        copyAcc.average =
          (copyAcc.average * (averageCount - managee.count) + managee.average * managee.count) /
          averageCount;
      }

      if (managee.date && copyAcc.date && managee.date > copyAcc.date) {
        copyAcc.date = managee.date;
      }

      copyAcc.count += managee.count;

      return copyAcc;
    },
    {
      date: null,
      count: 0,
      average: null,
    } as AggregationData
  );
};

const paginateManagersAggregation = (
  managersAggregation: ManagerAggregation[],
  pagination: Pagination = { page: 1, perPage: 10 }
): PaginatedManagersAggregation => {
  const count = managersAggregation.length;
  let results = managersAggregation;

  if (count > pagination.perPage) {
    results = managersAggregation.slice(
      (pagination.page - 1) * pagination.perPage,
      pagination.page * pagination.perPage
    );
  }

  return {
    page: pagination.page,
    perPage: pagination.perPage,
    totalCount: count,
    results: results,
  };
};

export async function getManagersAggregation(
  filters: GetManagersAggregationFilters = {},
  pagination: Pagination = { page: 1, perPage: 10 },
  orderBy: ManagersAggregationSort = ManagersAggregationSort.NameAsc
): Promise<PaginatedManagersAggregation> {
  const managers = await getManagersWithManagees(filters);
  const dateFilter =
    filters.start && filters.end
      ? ({ start: filters.start, end: filters.end } as DateInterval)
      : undefined;

  const res = managers
    .map<ManagerAggregation>((manager: ManagerWithManageesFeedbacks) => {
      const managees = manager.managees;
      const manageesAggregation = getManageesAggregation(managees, dateFilter).sort(
        getSortFunction(orderBy)
      );
      const aggregatedData = getManagerAggregation(manageesAggregation);

      return {
        id: manager.id,
        name: manager.name,
        pictureURL: manager.pictureURL,
        ...aggregatedData,
        managees: manageesAggregation,
      };
    })
    .sort(getSortFunction(orderBy));

  return paginateManagersAggregation(res, pagination);
}

const sortManageesAggregationByName =
  (isInverted = false) =>
  (aggregationA: EmployeeAggregation, aggregationB: EmployeeAggregation) => {
    const name1 = isInverted ? aggregationB.name.toUpperCase() : aggregationA.name.toUpperCase();
    const name2 = isInverted ? aggregationA.name.toUpperCase() : aggregationB.name.toUpperCase();

    if (name1 < name2) return -1;
    if (name1 > name2) return 1;
    return 0;
  };

const sortManageesAggregationByNumber =
  (key: 'average' | 'count', isInverted = false) =>
  (aggregationA: EmployeeAggregation, aggregationB: EmployeeAggregation) => {
    const number1 = isInverted ? aggregationB[key] : aggregationA[key];
    const number2 = isInverted ? aggregationA[key] : aggregationB[key];

    if (number1 === null || (number2 && number1 < number2)) return -1;
    if (number2 === null || number1 > number2) return 1;
    return 0;
  };

const sortManagersAggregationByDate =
  (isInverted = false) =>
  (aggregationA: EmployeeAggregation, aggregationB: EmployeeAggregation) => {
    const date1 = getTimeResetDateOrNull(isInverted ? aggregationB.date : aggregationA.date);
    const date2 = getTimeResetDateOrNull(isInverted ? aggregationA.date : aggregationB.date);

    if (!date1) return -1;
    if (!date2) return 1;

    return date1.getTime() - date2.getTime();
  };

const getSortFunction = (orderBy: ManagersAggregationSort) => {
  switch (orderBy) {
    case ManagersAggregationSort.NameAsc:
      return sortManageesAggregationByName();
    case ManagersAggregationSort.NameDesc:
      return sortManageesAggregationByName(true);
    case ManagersAggregationSort.AverageAsc:
      return sortManageesAggregationByNumber('average');
    case ManagersAggregationSort.AverageDesc:
      return sortManageesAggregationByNumber('average', true);
    case ManagersAggregationSort.CountAsc:
      return sortManageesAggregationByNumber('count');
    case ManagersAggregationSort.CountDesc:
      return sortManageesAggregationByNumber('count', true);
    case ManagersAggregationSort.DateAsc:
      return sortManagersAggregationByDate();
    case ManagersAggregationSort.DateDesc:
      return sortManagersAggregationByDate(true);
  }
};

const getTimeResetDateOrNull = (date: Date | null) =>
  date && new Date(date.getFullYear(), date.getMonth(), date.getDate());
