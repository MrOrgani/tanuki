import { RoleType, Startup, User } from '@prisma/client';
import withRoleGuardAPIHandler from 'middlewares/withRoleGuardAPIHandler';
import { NextApiRequest, NextApiResponse } from 'next';
import { getManagersAggregation } from 'services/employees-service';
import { GetManagersAggregationFilters, ManagersAggregationSort } from 'types/employee';
import logger from 'utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse, user: User) {
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET':
      return handleGetManagersAggregation(req, res, user);
    default:
      return res.setHeader('Allow', 'GET').status(405).send(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetManagersAggregation(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { page, perPage, q, end, start, startups, sort } = req.query;

  try {
    const pagination = {
      page: page ? parseInt(page.toString()) : 1,
      perPage: perPage ? parseInt(perPage.toString()) : 10,
    };

    const filters: GetManagersAggregationFilters = {
      ...(q && q.length ? { q: q.toString() } : {}),
      ...(end ? { end: new Date(end.toString()) } : {}),
      ...(start ? { start: new Date(start.toString()) } : {}),
      ...(startups
        ? { startups: (typeof startups === 'string' ? [startups] : startups) as Startup[] }
        : {}),
      ...(user.role === RoleType.manager ? { managers: [user.id] } : {}),
    };

    const orderBy = (sort as ManagersAggregationSort) || ManagersAggregationSort.NameAsc;

    const result = await getManagersAggregation(filters, pagination, orderBy);
    logger.info('Aggregation of manager Ok');
    res.json(result);
  } catch (e) {
    logger.error(`error when aggregation of manager: ${(e as Error).message}`);
    res.status(500).json({
      message: (e as Error).message,
    });
  }
}

export default withRoleGuardAPIHandler(handler);
