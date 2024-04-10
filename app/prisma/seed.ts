/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { manyUsers as users } from '../mockData/users';
import { manyClients as clients } from '../mockData/clients';
import { manyAccounts as accounts } from '../mockData/accounts';
import { manyFeedbacks as feedbacks } from '../mockData/feedbacks';
import { manyEmployees as employees } from '../mockData/employees';

const db = new PrismaClient();

(async () => {
  try {
    // Truncate all table before seeding
    await db.$transaction([
      db.user.deleteMany(),
      db.account.deleteMany(),
      db.employee.deleteMany(),
      db.client.deleteMany(),
      db.feedback.deleteMany(),
    ]);

    /* users */
    const usersInsertion = await db.user.createMany({ data: users });

    /* employees */
    const employeesInsertion = await db.employee.createMany({
      data: employees.map(employee => {
        const { manager, ...data } = employee;
        return data;
      }),
    });

    /* accounts */
    const accountsInsertion = await db.account.createMany({
      data: accounts.map(account => {
        const { accountManager, ...data } = account;
        return data;
      }),
    });

    /* clients */
    const clientsInsertion = await db.client.createMany({
      data: clients.map(client => {
        const { account, ...data } = client;
        return data;
      }),
    });

    /* feedbacks */
    const feedbacksInsertion = await db.feedback.createMany({
      data: feedbacks.map(feedback => {
        const { client, employee, ...data } = feedback;
        return data;
      }),
    });

    console.log(
      `${usersInsertion.count} users created\n`,
      `${employeesInsertion.count} employees created\n`,
      `${accountsInsertion.count} accounts created\n`,
      `${clientsInsertion.count} clients created\n`,
      `${feedbacksInsertion.count} feedbacks created\n`
    );
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
})();
