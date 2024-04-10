import { NextApiRequest, NextApiResponse } from 'next';
import { toCsv } from 'utils/csv';
import { FeedbackExportRow, GetFeedbacksFilters } from 'types/feedback';
import { RoleType } from '@prisma/client';
import { FeedbackExportSchema } from 'schemas/formSchemas';
import withRoleGuardAPIHandler from 'middlewares/withRoleGuardAPIHandler';
import logger from 'utils/logger';
import { getFeedbackExportResults, getFeedbacksExportCsvHeaders } from 'services/export-service';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-type', 'application/json');
  switch (req.method) {
    case 'POST':
      await handleExportFeedbacks(req, res);
      break;
    default:
      res.setHeader('Allow', 'POST').status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleExportFeedbacks(req: NextApiRequest, res: NextApiResponse) {
  try {
    await FeedbackExportSchema.validateAsync(req.body);
  } catch (err) {
    const message = `Invalid parameter for the export file generation : ${(err as Error).message}`;
    logger.warn(message);
    return res.status(400).json({ error: { status: 400, message } });
  }

  try {
    const filters: GetFeedbacksFilters = {
      dateFrom: new Date(req.body.start),
      dateUntil: new Date(req.body.end),
    };

    const data = await getFeedbackExportResults(filters);
    const csvContent = toCsv<FeedbackExportRow>(data, getFeedbacksExportCsvHeaders());

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="feedbacks-export.csv"`);
    res.send(csvContent);
    logger.info('L’export a été réalisé avec succès.');
  } catch (err) {
    const message = 'An unexpected error occured while generating the export file';
    res.status(500).json({ error: { status: 500, message } });
    logger.error(message);
  }
}

export default withRoleGuardAPIHandler(handler, [RoleType.admin]);
