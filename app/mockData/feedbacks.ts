import { singleClient, singleClient2, singleClient3 } from './clients';
import { FullFeedback } from 'types/feedback';
import { consultant, consultant2, consultant3, manager, manager2 } from './employees';

export const singleFeedback: FullFeedback = {
  id: '63510f62a577a8d0ce59f751',
  date: new Date('2022-11-10'),
  answers: {
    grade: 10,
    positives: 'positives',
    areasOfImprovement: 'improvements',
    context: 'context',
    objectives: 'objectives',
    details: 'details',
  },
  clientId: singleClient.id,
  client: singleClient,
  employeeId: consultant.email,
  employee: consultant,
  createdAt: new Date('2022-11-10'),
  updatedAt: null,
  createdBy: manager.email,
  updatedBy: manager.email,
};

export const manyFeedbacks: FullFeedback[] = [
  singleFeedback,
  {
    id: '63510f62a577a8d0ce59f752',
    date: new Date('2022-12-01'),
    answers: {
      grade: 5,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient2.id,
    client: singleClient2,
    employeeId: consultant3.email,
    employee: consultant3,
    createdAt: new Date('2022-12-01'),
    updatedAt: null,
    createdBy: consultant3.email,
    updatedBy: null,
  },
  {
    id: '63510f62a577a8d0ce59f753',
    date: new Date('2023-01-10'),
    answers: {
      grade: 9,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient2.id,
    client: singleClient2,
    employeeId: consultant2.email,
    employee: consultant2,
    createdAt: new Date('2023-01-10'),
    updatedAt: null,
    createdBy: consultant2.email,
    updatedBy: null,
  },
  {
    id: '63510f62a577a8d0ce59f754',
    date: new Date('2023-02-10'),
    answers: {
      grade: 2,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient3.id,
    client: singleClient2,
    employeeId: consultant2.email,
    employee: consultant2,
    createdAt: new Date('2023-02-10'),
    updatedAt: null,
    createdBy: consultant2.email,
    updatedBy: null,
  },
  {
    id: '63510f62a577a8d0ce59f755',
    date: new Date('2023-02-12'),
    answers: {
      grade: 4,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient3.id,
    client: singleClient2,
    employeeId: manager.email,
    employee: manager,
    createdAt: new Date('2023-02-12'),
    updatedAt: null,
    createdBy: manager.email,
    updatedBy: null,
  },
  {
    id: '63510f62a577a8d0ce59f756',
    date: new Date('2023-02-25'),
    answers: {
      grade: 7,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient2.id,
    client: singleClient2,
    employeeId: manager2.email,
    employee: manager2,
    createdAt: new Date('2023-02-25'),
    updatedAt: null,
    createdBy: manager2.email,
    updatedBy: null,
  },
];

export const feedbacksWithMissingData: FullFeedback[] = [
  singleFeedback,
  {
    id: '63510f62a577a8d0ce59f758',
    date: new Date('2022-12-01'),
    answers: {
      grade: 5,
      positives: 'none',
      areasOfImprovement: 'many',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    employeeId: consultant2.email,
    clientId: null,
    client: null,
    employee: consultant2,
    createdAt: new Date('2022-12-01'),
    updatedAt: null,
    createdBy: consultant2.email,
    updatedBy: null,
  },
];

export const feedbacksForSameConsultant: FullFeedback[] = [
  singleFeedback,
  {
    id: '63510f62a577a8d0ce59f759',
    date: new Date('2022-07-19'),
    answers: {
      grade: 10,
      positives: 'positives',
      areasOfImprovement: 'improvements',
      context: 'context',
      objectives: 'objectives',
      details: 'details',
    },
    clientId: singleClient.id,
    client: singleClient,
    employeeId: consultant.email,
    employee: consultant,
    createdAt: new Date('2023-07-19'),
    updatedAt: null,
    createdBy: consultant.email,
    updatedBy: null,
  },
];