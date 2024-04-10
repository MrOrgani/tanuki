import { RoleType, User } from '@prisma/client';
import { accountManager, ceo, manager, manager2 } from './employees';

export const managerUser: User = {
  id: manager.id,
  email: manager.email,
  name: manager.name,
  pictureURL: manager.pictureURL,
  role: RoleType.manager,
};

export const managerUser2: User = {
  id: manager2.id,
  email: manager2.email,
  name: manager2.name,
  pictureURL: manager2.pictureURL,
  role: RoleType.manager,
};

export const adminUser: User = {
  id: accountManager.id,
  email: accountManager.email,
  name: accountManager.name,
  pictureURL: accountManager.pictureURL,
  role: RoleType.admin,
};

export const adminUser2: User = {
  id: ceo.id,
  email: ceo.email,
  name: ceo.name,
  pictureURL: ceo.pictureURL,
  role: RoleType.admin,
};

export const manyUsers: User[] = [managerUser, managerUser2, adminUser, adminUser2];
