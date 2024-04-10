import { DateInterval, PeriodOption } from 'types/date';

export const getCurrentDateString = () => new Date(Date.now()).toISOString().slice(0, 10);

// YY-MM-DD
export const toStandardDateFormat = (d: Date): string => d.toISOString().slice(0, 10);

// DD/MM/YY
export const toDisplayDateFormat = (d: Date): string => d.toLocaleDateString('fr-FR');

export const getFullLetterMonthDateString = (date: string) => {
  const lowercaseDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

  return `${lowercaseDate.charAt(0).toUpperCase()}${lowercaseDate.slice(1)}`;
};

// The Tanuki semester periods are defined as follows :
// Semester 1 : Februrary 1st - July 31st
// Semester 2 : August 1st  - January 31st
export const getYearSemestersIntervals = (year?: number): DateInterval[] => {
  const currentYear = year || new Date().getFullYear();
  const firstSemesterStart = new Date(Date.UTC(currentYear, 1, 1));
  const firstSemesterEnd = new Date(Date.UTC(currentYear, 6, 31));
  const secondSemesterStart = new Date(Date.UTC(currentYear, 7, 1));
  const secondSemesterEnd = new Date(Date.UTC(currentYear + 1, 0, 31));

  return [
    { start: firstSemesterStart, end: firstSemesterEnd },
    { start: secondSemesterStart, end: secondSemesterEnd },
    { start: firstSemesterStart, end: secondSemesterEnd },
  ];
};

export const findSelectedPeriodOption = (options: PeriodOption[]): PeriodOption => {
  return options.find(option => option.selected) || options[0];
};

// First semester is defined as follows : Februrary 1st - July 31st
const getFirstSemesterInterval = (year: number): DateInterval => {
  return {
    start: new Date(Date.UTC(year, 1, 1)),
    end: new Date(Date.UTC(year, 6, 31)),
  };
};

// Second semester is defined as follows : August 1st - January 31st
const getSecondSemesterInterval = (year: number): DateInterval => {
  return {
    start: new Date(Date.UTC(year, 7, 1)),
    end: new Date(Date.UTC(year + 1, 0, 31)),
  };
};

export const findSemesterInterval = (date: Date): DateInterval => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // If the date is in January, it is in the second semester of the previous year
  if (month === 0) {
    return getSecondSemesterInterval(year - 1);
  } else if (month >= 1 && month <= 6) {
    return getFirstSemesterInterval(year);
  }

  return getSecondSemesterInterval(year);
};
