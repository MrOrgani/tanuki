import { Prisma } from '@prisma/client';

export type AccountWithACMA = Prisma.AccountGetPayload<{ include: { accountManager: true } }>;
