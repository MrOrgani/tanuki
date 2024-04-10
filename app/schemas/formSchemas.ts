import { getCurrentDateString } from 'utils/date';
import Joi from 'joi';
import { CreateClientData } from 'types/client';
import { CreateOrUpdateFeedbackData } from 'types/feedback';
import { EmployeesExportType } from 'types/employee';

const JoiWithDate = require('joi').extend(require('@joi/date'));

export const CreateClientSchema = Joi.object<CreateClientData, true>({
  name: Joi.string().required(),
  email: Joi.string().email({ minDomainSegments: 2 }).optional(),
  accountId: Joi.string(),
  accountData: Joi.object({
    name: Joi.string().required(),
    accountManagerId: Joi.string(),
  }),
  details: Joi.string().allow('').optional(),
}).xor('accountId', 'accountData');

export const CreateOrUpdateFeedbackSchema = Joi.object<CreateOrUpdateFeedbackData, true>({
  clientId: Joi.string().required(),
  employeeId: Joi.string().email({ minDomainSegments: 2 }).required(),
  answers: Joi.object({
    grade: Joi.number().max(10).min(0.5).required(),
    positives: Joi.string().max(10000).required(),
    areasOfImprovement: Joi.string().max(10000).required(),
    context: Joi.string().max(10000).required(),
    objectives: Joi.string().max(10000).required(),
    details: Joi.string().max(10000).allow('').optional(),
  }).required(),
  date: JoiWithDate.date()
    .format('YYYY-MM-DD')
    .min('2022-02-01')
    .max(getCurrentDateString())
    .required(),
  createdBy: Joi.string().email({ minDomainSegments: 2 }).optional(),
  updatedBy: Joi.string().email({ minDomainSegments: 2 }).optional(),
});

export const FeedbackExportSchema = Joi.object({
  start: JoiWithDate.date().format('YYYY-MM-DD').allow(''),
  end: JoiWithDate.date().format('YYYY-MM-DD').allow(''),
});

export const EmployeesExportSchema = Joi.object({
  start: JoiWithDate.date().format('YYYY-MM-DD').required(),
  end: JoiWithDate.date().format('YYYY-MM-DD').required(),
  type: Joi.string()
    .valid(...Object.values(EmployeesExportType))
    .optional(),
});
