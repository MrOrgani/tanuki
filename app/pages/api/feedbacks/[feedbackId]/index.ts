import { NextApiRequest, NextApiResponse } from 'next';
import withRoleGuardAPIHandler from 'middlewares/withRoleGuardAPIHandler';
import logger from 'utils/logger';
import { deleteFeedback } from 'services/feedbacks-service';
import ApplicationError from 'errors/ApplicationError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  switch (req.method) {
    case 'DELETE':
      return await handleDeleteFeedback(req, res);
    default:
      return res.setHeader('Allow', 'DELETE').status(405).send(`Method ${req.method} Not Allowed`);
  }
}

async function handleDeleteFeedback(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.feedbackId as string;

  try {
    await deleteFeedback(id);
    res.status(204).end();
    logger.info('Deleting feedback OK');
  } catch (e) {
    if (e instanceof ApplicationError) {
      logger.error(`Error when deleting feedback: ${e.message}`);
      res.status(e.code).json({ error: { status: e.code, message: e.message } });
      return;
    }
    res.status(500).json({
      error: { status: 500, message: `Error when deleting feedback` },
    });
    logger.error(`Error when deleting feedback: ${(e as Error).message}`);
  }
}

export default withRoleGuardAPIHandler(handler);
