import { PeriodOption } from 'types/date';
import { getYearSemestersIntervals } from 'utils/date';
import { getOldestFeedback } from './feedbacks-service';
import { GetOldestFeedbackFilters } from 'types/feedback';
import ApplicationError from 'errors/ApplicationError';
import { ErrorCode } from 'types/errors';

interface GetPeriodOptionsFilters extends GetOldestFeedbackFilters {
  until?: Date;
  default?: PeriodOption['key'] | null;
}

export const getPeriodFilterOptions = async (
  options: GetPeriodOptionsFilters = {}
): Promise<PeriodOption[]> => {
  const oldestFeedback = await getOldestFeedback(options);
  const startDate = oldestFeedback?.date || new Date();
  const periodOptions = buildPeriodOptions(startDate, options.until);

  // change the default selected option when provided in the options argument
  const shouldUpdateSelected =
    options.default &&
    periodOptions.some(option => option.key === options.default && !option.selected);

  return shouldUpdateSelected
    ? periodOptions.map(option =>
        option.key === options.default
          ? { ...option, selected: true }
          : { ...option, selected: false }
      )
    : periodOptions;
};

export const buildPeriodOptions = (from: Date, until?: Date): PeriodOption[] => {
  const end = until || new Date();
  const startYear = from.getFullYear() - (from.getMonth() === 0 ? 1 : 0);
  const endYear = end.getFullYear() - (end.getMonth() === 0 ? 1 : 0);
  const options: PeriodOption[] = [];

  if (from.getTime() > end.getTime()) {
    throw new ApplicationError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Cannot build period options: `from` date is after `until` date'
    );
  }

  for (let year = endYear; year >= startYear; year--) {
    const [firstSemester, secondSemester, fullYear] = getYearSemestersIntervals(year);

    // When the latest date is in the 1st semester, we want to keep the `S1 [year]` option only
    if (year === endYear && end.getTime() < secondSemester.start.getTime()) {
      options.push({
        label: `S1 ${year}`,
        key: `s1_${year}`,
        range: firstSemester,
        selected: true,
      });
    }
    // When the oldest date is in the 2nd semester, we want to keep the `S2 [year]` and `Ànnée [year]` options only
    else if (year === startYear && from.getTime() >= secondSemester.start.getTime()) {
      options.push(
        { label: `Année ${year}`, key: `year_${year}`, range: fullYear },
        {
          label: `S2 ${year}`,
          key: `s2_${year}`,
          range: secondSemester,
          selected: year === endYear,
        }
      );
    }
    // Add full options otherwise
    else {
      options.push(
        { label: `Année ${year}`, key: `year_${year}`, range: fullYear },
        {
          label: `S2 ${year}`,
          key: `s2_${year}`,
          range: secondSemester,
          selected: year === endYear,
        },
        { label: `S1 ${year}`, key: `s1_${year}`, range: firstSemester }
      );
    }
  }

  return options;
};
