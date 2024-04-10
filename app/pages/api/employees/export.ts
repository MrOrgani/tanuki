import { NextApiRequest, NextApiResponse } from 'next';
import { toCsv } from 'utils/csv';
import { RoleType, User } from '@prisma/client';
import { EmployeesExportSchema } from 'schemas/formSchemas';
import withRoleGuardAPIHandler from 'middlewares/withRoleGuardAPIHandler';
import { getEmployeeExportResults, getEmployeesExportCsvHeaders } from 'services/export-service';
import { EmployeeExportRow, EmployeesExportType, GetEmployeesExportFilters } from 'types/employee';
import logger from 'utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse, user: User) {
  res.setHeader('Content-type', 'application/json');
  switch (req.method) {
    case 'POST':
      await handleExportDownload(req, res, user);
      break;
    default:
      res.setHeader('Allow', 'POST').status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleExportDownload(req: NextApiRequest, res: NextApiResponse, user: User) {
  try {
    await EmployeesExportSchema.validateAsync({ ...req.body });
  } catch (err) {
    const message = `Invalid parameter for the export file generation : ${(err as Error).message}`;
    logger.warn(message);
    return res.status(400).json({ error: { status: 400, message } });
  }

  try {
    const filters: GetEmployeesExportFilters = {
      userId: user.id,
      start: new Date(req.body.start),
      end: new Date(req.body.end),
      type:
        user.role === RoleType.manager
          ? EmployeesExportType.Managees
          : (req.body.type as EmployeesExportType),
    };

    const data = await getEmployeeExportResults(filters);
    const csvContent = toCsv<EmployeeExportRow>(data, getEmployeesExportCsvHeaders());

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="employees-export.csv"`);
    res.send(csvContent);
    logger.info('L’export a été réalisé avec succès.');
  } catch (err) {
    const message = 'An unexpected error occured while generating the export file';
    res.status(500).json({ error: { status: 500, message } });
    logger.error(message);
  }
}

export default withRoleGuardAPIHandler(handler);
