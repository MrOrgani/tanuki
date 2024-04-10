import 'express';
import { User } from '@prisma/client';

interface Locals {
  user?: User | null;
}

declare module 'express' {
  export interface Response {
    locals: Locals;
  }
}
