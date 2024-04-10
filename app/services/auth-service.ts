import { Request } from 'express';
import { getEmployeeByEmail } from './employees-service';

const appEnv = process.env.APP_ENV;

export async function getEmployeeFromIAPHeader(req: Request) {
  const userEmail = getEmailFromIAPHeader(req);
  if (userEmail && typeof userEmail === 'string') {
    const user = await getEmployeeByEmail(userEmail);
    return user;
  }
}

export function getEmailFromIAPHeader(req: Request) {
  if (appEnv === 'local') {
    return process.env.USER_EMAIL;
  } else {
    return (req.headers['x-goog-authenticated-user-email'] as string)?.split(':')[1];
  }
}
