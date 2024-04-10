import { AccountWithACMA } from 'types/account';
import { accountManager, accountManager2 } from './employees';

export const manyAccounts: AccountWithACMA[] = [
  {
    id: '63510f62a577a8d0ce59f751',
    name: 'Dunder-Mifflin',
    accountManagerId: accountManager.email,
    accountManager,
  },
  {
    id: '63510f68a577a8d0ce59f752',
    name: 'Umbrella Corporation',
    accountManagerId: accountManager2.email,
    accountManager: accountManager2,
  },
  {
    id: '63510f68a577a8d0ce59f753',
    name: 'Wayne Adventures',
    accountManagerId: accountManager.email,
    accountManager: accountManager,
  },
];
