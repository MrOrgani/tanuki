import { RoleType } from '@prisma/client';

export interface CreateUserData {
  id: string;
  email: string;
  name: string;
  pictureURL: string;
  role: RoleType;
}
