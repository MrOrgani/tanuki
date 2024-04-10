import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import singletonRouter from 'next/router';
import { manyClients } from 'mockData/clients';
import { manyEmployees } from 'mockData/employees';
import { manyAccounts } from 'mockData/accounts';
import { singleFeedback } from 'mockData/feedbacks';
import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';
import { startMsw } from 'tests/test-utils';
import { handlers } from 'mocks/handlers';
import UserProvider from 'contexts/user';
import { adminUser } from 'mockData/users';

startMsw(handlers);

const mockServices = {
  employee: {
    getEmployees: jest.fn(),
  },
  account: {
    getAccounts: jest.fn(),
  },
  client: {
    getClients: jest.fn(),
  },
  feedback: {
    getFeedbackById: jest.fn().mockResolvedValue(singleFeedback),
    updateFeedbackAnswers: jest.fn().mockResolvedValue(singleFeedback),
  },
};

jest.mock('next/dist/client/router', () => require('next-router-mock'));
jest.mock('services/accounts-service', () => mockServices.account);
jest.mock('services/clients-service', () => mockServices.client);
jest.mock('services/employees-service', () => mockServices.employee);
jest.mock('services/feedbacks-service.ts', () => mockServices.feedback);

describe('the feedback form component', () => {
  const NewFeedback = require('pages/feedbacks/[feedbackId]/edit')
    .default as typeof import('pages/feedbacks/[feedbackId]/edit').default;
  const user = userEvent.setup();

  it('should display the page title', () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback
          ACMAs={[]}
          employees={[]}
          accounts={[]}
          clients={[]}
          feedback={singleFeedback}
        />
      </UserProvider>
    );
    expect(screen.getByText('Editer un feedback')).toBeInTheDocument();
  });

  it('should return to the feedback details when clicking on the cancel button and selecting "Oui" on the modal window', async () => {
    singletonRouter.push(`/feedbacks/${singleFeedback.id}`);
    render(
      <ConfirmationModalProvider>
        <UserProvider user={adminUser}>
          <NewFeedback
            ACMAs={[]}
            employees={[]}
            accounts={[]}
            clients={[]}
            feedback={singleFeedback}
          />
        </UserProvider>
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByText('Annuler'));
    await user.click(await screen.findByText('Oui'));

    expect(singletonRouter).toMatchObject({ asPath: `/feedbacks/${singleFeedback.id}` });
  });

  it('should stay on the page when clicking on the cancel button and selecting "Non" on the modal window', async () => {
    singletonRouter.push(`/feedbacks/${singleFeedback.id}/edit`);
    render(
      <ConfirmationModalProvider>
        <UserProvider user={adminUser}>
          <NewFeedback
            ACMAs={[]}
            employees={[]}
            accounts={[]}
            clients={[]}
            feedback={singleFeedback}
          />
        </UserProvider>
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByText('Annuler'));
    await user.click(await screen.findByText('Non'));

    expect(singletonRouter).toMatchObject({ asPath: `/feedbacks/${singleFeedback.id}/edit` });
  });

  it('should display a disabled "Enregistrer les modifications" button', () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback
          ACMAs={[]}
          employees={[]}
          accounts={[]}
          clients={[]}
          feedback={singleFeedback}
        />
      </UserProvider>
    );

    expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
  });

  it('should display the information of the feedback', async () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback
          ACMAs={[]}
          employees={[]}
          accounts={[]}
          clients={[]}
          feedback={singleFeedback}
        />
      </UserProvider>
    );

    const pos = singleFeedback.answers.positives || '';
    const improvement = singleFeedback.answers.areasOfImprovement || '';
    const currentClient = `${singleFeedback.client?.name} - ${singleFeedback.client?.account.name}`;

    expect(screen.getByDisplayValue(singleFeedback.employee.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(currentClient)).toBeInTheDocument();

    const slider: HTMLInputElement = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('10');

    expect(screen.getByText(pos)).toBeInTheDocument();
    expect(screen.getByText(improvement)).toBeInTheDocument();
  });

  it('should redirect to the feedback list page when successfully created', async () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback
          ACMAs={[]}
          employees={manyEmployees}
          accounts={manyAccounts}
          clients={manyClients}
          feedback={singleFeedback}
        />
      </UserProvider>
    );

    await user.type(
      screen.getByLabelText('Quels sont les points forts de l’Hubvisor ?'),
      'changement de points positifs'
    );
    await user.click(screen.getByText('Enregistrer les modifications'));

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({ asPath: `/feedbacks/${singleFeedback.id}` });
    });
  });
});
