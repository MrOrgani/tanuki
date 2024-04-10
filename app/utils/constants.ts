import { Startup } from '@prisma/client';

export const MAIN_ENTITIES: Startup[] = [
  Startup.epic,
  Startup.atom,
  Startup.source,
  Startup.summit,
  Startup.campus,
];

export const COOKIE_NAME_PERIOD = 'tanuki-period';
