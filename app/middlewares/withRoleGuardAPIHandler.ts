import { User } from '@prisma/client';
import { Response } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';

const withRoleGuardAPIHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>,
  roles?: Array<string>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = (res as unknown as Response).locals?.user;

    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    if (roles && !roles.includes(user.role)) {
      return res.status(403).send('Forbidden');
    }

    return handler(req, res, user);
  };
};

export default withRoleGuardAPIHandler;
