import { ManagerAggregation, ManagerWithManageesFeedbacks } from 'types/employee';
import {
  consultant,
  consultant2,
  consultant3,
  consultant4,
  consultant5,
  consultant7,
  manager,
  manager2,
  manager3,
  manager4,
} from './employees';

/* 
  /!\ This values are the final results from the db query, after parsing and reformating the data
  /!\ Be careful when changing the values, it is closely related to the mock data 'managersWithManageesFeedbacks'
*/
export const managersAggregation: ManagerAggregation[] = [
  {
    id: manager3.id,
    name: manager3.name,
    pictureURL: manager3.pictureURL,
    average: 8,
    date: new Date('2023-02-08'),
    count: 2,
    managees: [
      {
        id: consultant5.id,
        name: consultant5.name,
        pictureURL: consultant5.pictureURL,
        average: 8,
        date: new Date('2023-02-08'),
        count: 2,
      },
    ],
  },
  {
    id: manager2.id,
    name: manager2.name,
    pictureURL: manager2.pictureURL,
    average: 9.5,
    date: new Date('2023-01-30'),
    count: 8,
    managees: [
      {
        id: consultant4.id,
        name: consultant4.name,
        pictureURL: consultant4.pictureURL,

        average: 10,
        date: new Date('2023-01-30'),
        count: 4,
      },
      {
        id: consultant3.id,
        name: consultant3.name,
        pictureURL: consultant3.pictureURL,

        average: 9,
        date: new Date('2023-01-29'),
        count: 4,
      },
    ],
  },
  {
    id: manager4.id,
    name: manager4.name,
    pictureURL: manager4.pictureURL,
    average: 9.5,
    date: new Date('2023-02-05'),
    count: 2,
    managees: [
      {
        id: consultant7.id,
        name: consultant7.name,
        pictureURL: consultant7.pictureURL,
        average: 9.5,
        date: new Date('2023-02-05'),
        count: 2,
      },
    ],
  },
  {
    id: manager.id,
    name: manager.name,
    pictureURL: manager.pictureURL,
    average: 7,
    date: new Date('2023-02-02'),
    count: 6,
    managees: [
      {
        id: consultant2.id,
        name: consultant2.name,
        pictureURL: consultant2.pictureURL,

        average: 8.5,
        date: new Date('2023-02-01'),
        count: 3,
      },
      {
        id: consultant.id,
        name: consultant.name,
        pictureURL: consultant.pictureURL,

        average: 6,
        date: new Date('2023-01-30'),
        count: 2,
      },
      {
        id: consultant3.id,
        name: consultant3.name,
        pictureURL: consultant3.pictureURL,
        average: 4.5,
        date: new Date('2023-02-02'),
        count: 1,
      },
    ],
  },
];

/* 
  /!\ This values are used as mock data for the aggregation db query
  /!\ Be careful when changing the values, it is closely related to the mock data 'managersAggregation
*/
export const managersWithManageesFeedbacks: ManagerWithManageesFeedbacks[] = [
  {
    id: manager.id,
    name: manager.name,
    pictureURL: manager.pictureURL,
    contractEndDate: null,
    managees: [
      {
        id: consultant.id,
        name: consultant.name,
        pictureURL: consultant.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 6,
            },
          },
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 6,
            },
          },
        ],
      },
      {
        id: consultant2.id,
        name: consultant2.name,
        pictureURL: consultant2.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-02-01'),
            answers: {
              grade: 10,
            },
          },
          {
            date: new Date('2023-02-01'),
            answers: {
              grade: 5.5,
            },
          },
          {
            date: new Date('2023-02-01'),
            answers: {
              grade: 10,
            },
          },
        ],
      },
      {
        id: consultant3.id,
        name: consultant3.name,
        pictureURL: consultant3.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-02-02'),
            answers: {
              grade: 4.5,
            },
          },
        ],
      },
    ],
  },
  {
    id: manager2.id,
    name: manager2.name,
    pictureURL: manager2.pictureURL,
    contractEndDate: null,
    managees: [
      {
        id: consultant4.id,
        name: consultant4.name,
        pictureURL: consultant4.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 10,
            },
          },
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 10,
            },
          },
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 10,
            },
          },
          {
            date: new Date('2023-01-30'),
            answers: {
              grade: 10,
            },
          },
        ],
      },
      {
        id: consultant3.id,
        name: consultant3.name,
        pictureURL: consultant3.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-01-29'),
            answers: {
              grade: 9,
            },
          },
          {
            date: new Date('2023-01-29'),
            answers: {
              grade: 9,
            },
          },
          {
            date: new Date('2023-01-29'),
            answers: {
              grade: 9,
            },
          },
          {
            date: new Date('2023-01-29'),
            answers: {
              grade: 9,
            },
          },
        ],
      },
    ],
  },
  {
    id: manager3.id,
    name: manager3.name,
    pictureURL: manager3.pictureURL,
    contractEndDate: null,
    managees: [
      {
        id: consultant5.id,
        name: consultant5.name,
        pictureURL: consultant5.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-02-08'),
            answers: {
              grade: 7,
            },
          },
          {
            date: new Date('2023-02-08'),
            answers: {
              grade: 9,
            },
          },
        ],
      },
    ],
  },
  {
    id: manager4.id,
    name: manager4.name,
    pictureURL: manager4.pictureURL,
    contractEndDate: null,
    managees: [
      {
        id: consultant7.id,
        name: consultant7.name,
        pictureURL: consultant7.pictureURL,
        contractEndDate: null,
        feedbacks: [
          {
            date: new Date('2023-02-05'),
            answers: {
              grade: 10,
            },
          },
          {
            date: new Date('2023-02-05'),
            answers: {
              grade: 9,
            },
          },
        ],
      },
    ],
  },
];
