import { NextPageContext } from 'next';
import { getEmployees, getACMAs } from 'services/employees-service';
import { getAccounts } from 'services/accounts-service';
import { getClients } from 'services/clients-service';
import { serializeProps } from 'utils/serialize';
import FeedbackForm, { FeedbackFormProps } from 'components/FeedbackForm';
import { getFeedbackById } from 'services/feedbacks-service';
import { RoleType, User } from '@prisma/client';
import ApplicationError from 'errors/ApplicationError';
import { ErrorCode } from 'types/errors';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import { findSemesterInterval } from 'utils/date';

const handler = async (ctx: NextPageContext, user: User) => {
  const feedbackId = ctx.query.feedbackId?.toString();
  const feedback = feedbackId ? await getFeedbackById(feedbackId) : null;

  if (user.role === RoleType.manager && feedback?.employee.managerId !== user.id) {
    throw new ApplicationError(
      ErrorCode.FORBIDDEN,
      "You don't have access to this feedback",
      'FeedbackDetail'
    );
  }

  const [employees, accounts, clients, ACMAs] = await Promise.all([
    getEmployees({ allowEndDateSince: findSemesterInterval(new Date()).start }),
    getAccounts(),
    getClients(),
    getACMAs({ omitFormerEmployees: true }),
  ]);

  return {
    props: {
      feedback: serializeProps(feedback),
      employees: serializeProps(employees),
      accounts: serializeProps(accounts),
      clients: serializeProps(clients),
      ACMAs: serializeProps(ACMAs),
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

function EditFeedback({ employees, accounts, clients, feedback, ACMAs }: FeedbackFormProps) {
  return (
    <FeedbackForm
      employees={employees}
      accounts={accounts}
      clients={clients}
      feedback={feedback}
      ACMAs={ACMAs}
    />
  );
}

export default EditFeedback;
