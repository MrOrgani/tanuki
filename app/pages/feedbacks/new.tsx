import { NextPageContext } from 'next';
import { getACMAs, getEmployees } from 'services/employees-service';
import { getAccounts } from 'services/accounts-service';
import { getClients } from 'services/clients-service';
import { Response } from 'express';
import { serializeProps } from 'utils/serialize';
import FeedbackForm, { FeedbackFormProps } from 'components/FeedbackForm';
import { findSemesterInterval } from 'utils/date';

export const getServerSideProps = async (ctx: NextPageContext) => {
  const { user } = (ctx.res as Response).locals;
  const [employees, accounts, clients, ACMAs] = await Promise.all([
    getEmployees({ allowEndDateSince: findSemesterInterval(new Date()).start }),
    getAccounts(),
    getClients(),
    getACMAs({ omitFormerEmployees: true }),
  ]);
  return {
    props: {
      user: serializeProps(user),
      employees: serializeProps(employees),
      accounts: serializeProps(accounts),
      clients: serializeProps(clients),
      ACMAs: serializeProps(ACMAs),
    },
  };
};

export default function NewFeedback({ employees, accounts, clients, ACMAs }: FeedbackFormProps) {
  return <FeedbackForm employees={employees} accounts={accounts} clients={clients} ACMAs={ACMAs} />;
}
