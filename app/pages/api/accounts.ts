import { NextApiRequest, NextApiResponse } from 'next';
import { getAccounts } from 'services/accounts-service';
import logger from 'utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET': {
      await handleGetAccounts(req, res);
      break;
    }
    default:
      res.setHeader('Allow', 'GET');
      res.statusCode = 405;
      res.end(`Method ${req.method} Not Allowed`);
      break;
  }
}

async function handleGetAccounts(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.query?.toString();
  const accountManagerId = req.query.acma?.toString();

  try {
    const accounts = await getAccounts(query, accountManagerId);
    logger.info('Getting accounts OK');
    res.json(accounts);
  } catch (e) {
    logger.error(`error when getting accounts: ${(e as Error).message}`);
    res.status(500).json({
      message: (e as Error).message,
    });
  }
}
