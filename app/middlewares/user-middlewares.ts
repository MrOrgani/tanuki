import { Request, Response, NextFunction } from 'express';
import { getEmailFromIAPHeader } from '../services/auth-service';
import { checkUserAndCreate } from '../services/users-service';

export const userDataMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const email = getEmailFromIAPHeader(req);
  res.locals.user = email ? await checkUserAndCreate(email) : null;
  return next();
};
