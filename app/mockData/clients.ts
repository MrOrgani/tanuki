import { Client } from 'types/client';
import { manyAccounts } from './accounts';

export const singleClient: Client = {
  id: '63510f62a577a8d0ce59f751',
  details: '',
  name: 'Michael Scott',
  email: 'michael@dundermifflin.com',
  date: '2022-07-03',
  accountId: manyAccounts[0].id,
  account: manyAccounts[0],
};

export const singleClient2: Client = {
  id: '63510f68a577a8d0ce59f752',
  details: '',
  name: 'Albert Wesker',
  email: 'albert.wesker@umbrellacorp.com',
  date: '2022-07-03',
  accountId: manyAccounts[1].id,
  account: manyAccounts[1],
};

export const singleClient3: Client = {
  id: '63510f68a577a8d0ce59f753',
  details: '',
  name: 'James Cameron',
  email: 'james.cameron@umbrellacorp.com',
  date: '2022-12-03',
  accountId: manyAccounts[2].id,
  account: manyAccounts[2],
};

export const manyClients: Client[] = [singleClient, singleClient2, singleClient3];
