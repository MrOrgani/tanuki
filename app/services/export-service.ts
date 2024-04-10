import { Feedback, Prisma } from '@prisma/client';
import { DateInterval } from 'types/date';
import {
  EmployeeExportRow,
  EmployeesExportType,
  EmployeeWithFeedbacks,
  EMPLOYEE_TYPE,
  EMPLOYEE_TYPE_MAPPING,
  GetEmployeesExportFilters,
} from 'types/employee';
import { CsvHeader } from 'utils/csv';
import db from '../prisma/client';
import { MAIN_ENTITIES } from 'utils/constants';
import { FeedbackExportRow, GetFeedbacksFilters } from 'types/feedback';
import { getFeedbacks } from './feedbacks-service';
import { toDisplayDateFormat } from 'utils/date';
import { getNameFromEmail } from 'utils/name';

export async function getEmployeesWithFeedbacks(
  filters: GetEmployeesExportFilters
): Promise<EmployeeWithFeedbacks[]> {
  let conditions: Prisma.EmployeeWhereInput;

  if (filters.type === EmployeesExportType.Managees) {
    conditions = { id: { not: filters.userId }, managerId: filters.userId };
  } else {
    const keyFilter: keyof Prisma.StringFilter =
      filters.type === EmployeesExportType.Managers ? 'in' : 'notIn';
    conditions = { position: { [keyFilter]: EMPLOYEE_TYPE_MAPPING[EMPLOYEE_TYPE.MANAGER] } };
  }

  return db.employee.findMany({
    where: {
      ...conditions,
      startup: { in: MAIN_ENTITIES },
      OR: [{ contractEndDate: null }, { contractEndDate: { gt: filters.start } }],
    },
    include: { feedbacks: true },
    orderBy: { name: 'asc' },
  });
}

export function filterFeedbacksByPeriod(feedbacks: Feedback[], period: DateInterval) {
  period.end.setHours(23, 59, 59, 999);

  return feedbacks.filter(feedback => {
    return feedback.date >= period.start && feedback.date <= period.end;
  });
}

export function computeFeedbacksAverage(feedbacks: Feedback[]): number | null {
  return feedbacks.length
    ? feedbacks.reduce((sum, feedback) => sum + feedback.answers.grade, 0) / feedbacks.length
    : null;
}

export function formatAverage(n: number) {
  return n.toFixed(1).replace('.0', '').replace('.', ',');
}

export async function getEmployeeExportResults(
  filters: GetEmployeesExportFilters
): Promise<EmployeeExportRow[]> {
  const employees = await getEmployeesWithFeedbacks(filters);
  const results = employees.map(employee => {
    const average = computeFeedbacksAverage(
      filterFeedbacksByPeriod(employee.feedbacks, {
        start: filters.start,
        end: filters.end,
      })
    );

    return {
      name: employee.name,
      average: average ? formatAverage(average) : null,
    } as EmployeeExportRow;
  });

  return results;
}

export async function getFeedbackExportResults(
  filters: GetFeedbacksFilters
): Promise<FeedbackExportRow[]> {
  const feedbacks = await getFeedbacks(filters);
  const results = feedbacks.map(feedback => {
    return {
      name: feedback.employee.name,
      grade: feedback.answers.grade,
      client: feedback.client ? feedback.client.name : ' ',
      account: feedback.client ? feedback.client.account.name : ' ',
      manager: feedback.employee.managerId ? getNameFromEmail(feedback.employee.managerId) : ' ',
      date: toDisplayDateFormat(feedback.date),
    } as FeedbackExportRow;
  });

  return results;
}

export function getEmployeesExportCsvHeaders(): CsvHeader[] {
  return [
    { label: 'Hubvisor', property: 'name' },
    { label: 'NPS moyen', property: 'average' },
  ];
}

export function getFeedbacksExportCsvHeaders(): CsvHeader[] {
  return [
    { label: 'Hubvisor', property: 'name' },
    { label: 'NPS', property: 'grade' },
    { label: 'Compte', property: 'account' },
    { label: 'Interlocuteur', property: 'client' },
    { label: 'HOT', property: 'manager' },
    { label: 'Date du feedback', property: 'date' },
  ];
}

export function generateFeedbacksCsvFilename(
  startDate: Date | null = null,
  endDate: Date | null = null
): string {
  const formatDate = (date: Date): string => date.toLocaleDateString().replaceAll('/', '-');

  if (startDate && endDate) {
    return `feedbacks_from_${formatDate(startDate)}_until_${formatDate(endDate)}.csv`;
  }
  if (startDate) {
    return `feedbacks_from_${formatDate(startDate)}.csv`;
  }
  if (endDate) {
    return `feedbacks_until_${formatDate(endDate)}.csv`;
  }
  return `feedbacks_until_${formatDate(new Date())}.csv`;
}
