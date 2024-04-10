import db from '../prisma/client';
import { Employee, RoleType, User } from '@prisma/client';
import { CreateUserData } from 'types/user';
import { getEmployeeByEmail } from './employees-service';

const adminRoles = [
  'Co-fondateur',
  'VP',
  'HR Team Manager Senior',
  'Account Executive',
  'Responsable commercial',
  'Account Manager',
  'ACMA Team Manager',
];

function getRoleFromPosition(employee: Employee) {
  return adminRoles.includes(employee.position) ? RoleType.admin : RoleType.manager;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return db.user.findFirst({
    where: {
      id: email,
    },
  });
}

export async function createUser(createdUserData: CreateUserData): Promise<User> {
  return db.user.create({
    data: createdUserData,
  });
}

export async function checkUserAndCreate(email: string): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);
    if (user) {
      return user;
    }
    const employee = await getEmployeeByEmail(email);
    if (!employee) {
      return null;
    }

    const userDataCreation: CreateUserData = {
      id: employee.email,
      email: employee.email,
      name: employee.name,
      pictureURL: employee.pictureURL,
      role: getRoleFromPosition(employee),
    };
    return await createUser(userDataCreation);
  } catch (err) {
    console.error(err);
    return null;
  }
}
