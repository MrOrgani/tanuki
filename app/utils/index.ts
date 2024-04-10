import { Employee } from '@prisma/client';
import { FeedbackNpsTag } from 'types/feedback';
import { MAIN_ENTITIES } from 'utils/constants';

export const getNpsTagClassName = (n: number): FeedbackNpsTag => {
  if (n < 6.95) return FeedbackNpsTag.NEGATIVE;
  if (n <= 8.45) return FeedbackNpsTag.MODERATE;
  return FeedbackNpsTag.POSITIVE;
};

export const formatDecimalNumber = (n: number) => n.toFixed(1).replace('.', ',').replace(',0', '');

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const slugifyEmployee = (email: string) =>
  email.split('@')[0].replace('.', '_').toLowerCase();

export const unslugifyEmployee = (slug: string, emailDomain = 'hubvisory.com') =>
  `${slug.replace('_', '.')}@${emailDomain}`;

export const isConsultant = (employee: Employee) => {
  return MAIN_ENTITIES.includes(employee.startup);
};
