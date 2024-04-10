import { NextApiRequest, NextApiResponse } from 'next';
import { getEmployees } from 'services/employees-service';
import { EMPLOYEE_TYPE } from 'types/employee';
import logger from 'utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET': {
      await handleGetEmployees(req, res);
      break;
    }
    default:
      res.setHeader('Allow', 'GET');
      res.statusCode = 405;
      res.end(`Method ${req.method} Not Allowed`);
      break;
  }
}

async function handleGetEmployees(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.query || '';
  const employeeType = req.query.type || undefined;

  if (typeof query !== 'string') {
    return res.status(400).send('Please specify a single search query');
  }

  try {
    const employees = await getEmployees({
      query: query.length >= 3 ? query : undefined,
      employeeType: employeeType as EMPLOYEE_TYPE,
    });
    logger.info('Getting employees OK');
    res.json(employees);
  } catch (e) {
    logger.error(`error when getting employees: ${(e as Error).message}`);
    res.status(500).json({
      message: (e as Error).message,
    });
  }
}
