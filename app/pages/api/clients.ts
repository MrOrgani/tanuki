import ApplicationError from 'errors/ApplicationError';
import { NextApiRequest, NextApiResponse } from 'next';
import { CreateClientSchema } from 'schemas/formSchemas';
import { createClient, getClients } from 'services/clients-service';
import { CreateClientData } from 'types/client';
import { ErrorCode } from 'types/errors';
import logger from 'utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  switch (req.method) {
    case 'GET': {
      await handleGetClients(req, res);
      break;
    }
    case 'POST': {
      await handleCreateClients(req, res);
      break;
    }
    default:
      res.setHeader('Allow', 'GET, POST');
      res.statusCode = 405;
      res.end(`Method ${req.method} Not Allowed`);
      break;
  }
}

async function handleGetClients(req: NextApiRequest, res: NextApiResponse) {
  try {
    const clients = await getClients();
    logger.info('Getting clients OK');
    res.json(clients);
  } catch (e) {
    logger.error(`error when getting clients: ${(e as Error).message}`);
    res.status(500).json({ error: { statusCode: 500, message: (e as Error).message } });
  }
}

async function handleCreateClients(req: NextApiRequest, res: NextApiResponse) {
  const creationData = req.body as CreateClientData;

  try {
    const validationError = CreateClientSchema.validate(creationData).error;

    if (validationError) {
      throw new ApplicationError(
        ErrorCode.BAD_REQUEST,
        `Validation error: ${validationError.details.map(d => d.message).join(',')}`
      );
    }

    const newClient = await createClient(creationData);
    logger.info('Create client OK');
    res.status(201).json(newClient);
  } catch (e) {
    if (e instanceof ApplicationError) {
      logger.warn(e.message);
      return res.status(e.code).json({ error: e.toJson() });
    }

    logger.error(`error when creating client: ${(e as Error).message}`);
    res.status(500).json({ error: { statusCode: 500, message: (e as Error).message } });
  }
}
