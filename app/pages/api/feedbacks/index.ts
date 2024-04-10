import { NextApiRequest, NextApiResponse } from 'next';
import {
  createFeedback,
  getFeedbacks,
  getPaginatedFeedbacks,
  updateFeedbackAnswers,
} from 'services/feedbacks-service';
import {
  CreateOrUpdateFeedbackData,
  FeedbackRequestQuery,
  FeedbackSortableField,
  PaginatedFeedbacks,
} from 'types/feedback';
import { CreateOrUpdateFeedbackSchema } from 'schemas/formSchemas';
import { RoleType, Startup, User } from '@prisma/client';
import withRoleGuardAPIHandler from 'middlewares/withRoleGuardAPIHandler';
import logger from 'utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse, user: User) {
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET':
      return handleGetFeedbacks(req, res, user);
    case 'POST':
      return await handleNewFeedback(req, res, user);
    case 'PUT':
      return await handleUpdateFeedback(req, res, user);
    default:
      return res
        .setHeader('Allow', 'GET, POST, PUT')
        .status(405)
        .send(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetFeedbacks(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { filter, orderBy, pagination } = parseRequest(req.query);

  if (user.role === RoleType.manager) {
    filter.manager = filter.manager ? [...filter.manager, user.id] : [user.id];
  }

  try {
    const result: PaginatedFeedbacks =
      req.query.perPage || req.query.page
        ? await getPaginatedFeedbacks(pagination, filter, orderBy)
        : { feedbacks: await getFeedbacks(filter, orderBy) };

    logger.info('Getting feedbacks OK');
    res.json(result);
  } catch (e) {
    logger.error(`error when getting feedbacks: ${(e as Error).message}`);
    res.status(500).json({
      message: (e as Error).message,
    });
  }
}

async function handleNewFeedback(req: NextApiRequest, res: NextApiResponse, user: User) {
  const feedback = req.body as CreateOrUpdateFeedbackData;

  try {
    await CreateOrUpdateFeedbackSchema.validateAsync(feedback);

    const newFeedback = await createFeedback(feedback, user);
    logger.info('Creation of feedback OK');
    res.status(201).json(newFeedback);
  } catch (e) {
    logger.error(`error when creating feedback: ${(e as Error).message}`);
    res.status(400).send(`error when creating feedback: ${(e as Error).message}`);
  }
}

async function handleUpdateFeedback(req: NextApiRequest, res: NextApiResponse, user: User) {
  const { id: feedbackId, ...feedback } = req.body as CreateOrUpdateFeedbackData & { id: string };

  try {
    if (!feedbackId) throw new Error('feedbackId is required');
    await CreateOrUpdateFeedbackSchema.validateAsync(feedback);

    await updateFeedbackAnswers(feedbackId, feedback, user);
    logger.info('Updating feedback OK');
    res.status(204).end();
  } catch (e) {
    logger.error(`error when updating feedback: ${(e as Error).message}`);
    res.status(400).send(`error when updating feedback: ${(e as Error).message}`);
  }
}

function parseRequest(query: NextApiRequest['query']): FeedbackRequestQuery {
  return {
    filter: {
      ...(query.q ? { employee: query.q.toString() } : {}),
      ...(query.manager
        ? { manager: typeof query.manager === 'string' ? [query.manager] : query.manager }
        : {}),
      ...(query.startup
        ? {
            startup: (typeof query.startup === 'string'
              ? [query.startup]
              : query.startup) as Startup[],
          }
        : {}),
      ...(query.start ? { dateFrom: new Date(query.start.toString()) } : {}),
      ...(query.end ? { dateUntil: new Date(query.end.toString()) } : {}),
    },
    pagination: {
      perPage: query.perPage ? parseInt(query.perPage.toString()) : 10,
      page: query.page ? parseInt(query.page.toString()) : 1,
    },
    ...(query.sort ? { orderBy: query.sort as FeedbackSortableField } : {}),
  };
}

export default withRoleGuardAPIHandler(handler);
