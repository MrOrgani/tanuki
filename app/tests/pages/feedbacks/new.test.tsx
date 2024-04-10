import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import singletonRouter from 'next/router';
import { handlers } from 'mocks/handlers';
import { AlertProvider } from 'components/common/Alert/AlertProvider';
import { manyClients } from 'mockData/clients';
import {
  accountManager2,
  consultant3,
  manyAccountManagers,
  manyEmployees,
} from 'mockData/employees';
import { manyAccounts } from 'mockData/accounts';
import { startMsw } from 'tests/test-utils';
import { rest } from 'msw';
import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';
import { adminUser, managerUser } from 'mockData/users';
import { serializeProps } from 'utils/serialize';
import UserProvider from 'contexts/user';

const server = startMsw(handlers);

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const mockServices = {
  employee: {
    getEmployees: jest.fn(),
    getACMAs: jest.fn(),
  },
  account: {
    getAccounts: jest.fn(),
  },
  client: {
    getClients: jest.fn(),
  },
  feedback: {
    getFeedbackById: jest.fn(),
  },
};

jest.mock('services/employees-service', () => mockServices.employee);
jest.mock('services/accounts-service', () => mockServices.account);
jest.mock('services/clients-service', () => mockServices.client);
jest.mock('services/feedbacks-service', () => mockServices.feedback);

describe('the feedback creation page getServerSideProps', () => {
  const { getServerSideProps } = require('pages/feedbacks/new');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have clients, employees and accounts data as props', async () => {
    mockServices.employee.getEmployees.mockResolvedValue(manyEmployees);
    mockServices.account.getAccounts.mockResolvedValue(manyAccounts);
    mockServices.client.getClients.mockResolvedValue(manyClients);
    mockServices.employee.getACMAs.mockResolvedValue(manyAccountManagers);

    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
    });

    expect(response.props.employees).toStrictEqual(serializeProps(manyEmployees));
    expect(response.props.accounts).toStrictEqual(serializeProps(manyAccounts));
    expect(response.props.clients).toStrictEqual(serializeProps(manyClients));
    expect(response.props.ACMAs).toStrictEqual(serializeProps(manyAccountManagers));
  });
});

describe('the feedback form component', () => {
  const NewFeedback = require('pages/feedbacks/new')
    .default as typeof import('pages/feedbacks/new').default;
  const user = userEvent.setup();
  const NewFeedbackComponent = (
    <UserProvider user={adminUser}>
      <NewFeedback
        ACMAs={manyAccountManagers}
        employees={manyEmployees}
        accounts={manyAccounts}
        clients={manyClients}
      />
    </UserProvider>
  );

  it('should display the page title', () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback ACMAs={[]} employees={[]} accounts={[]} clients={[]} />
      </UserProvider>
    );
    expect(screen.getByText('Nouveau feedback')).toBeInTheDocument();
  });

  it('should return to the feedback list when clicking on the back arrow', async () => {
    singletonRouter.push('/feedbacks');
    render(
      <ConfirmationModalProvider>
        <UserProvider user={adminUser}>
          <NewFeedback ACMAs={[]} employees={[]} accounts={[]} clients={[]} />
        </UserProvider>
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByLabelText('retourner à la page précédente'));
    expect(singletonRouter).toMatchObject({ asPath: '/feedbacks' });
  });

  it('should stay on the page when clicking on the cancel button and selecting "Non" on the modal window', async () => {
    singletonRouter.push('/feedbacks/new');
    render(
      <ConfirmationModalProvider>
        <UserProvider user={adminUser}>
          <NewFeedback ACMAs={[]} employees={[]} accounts={[]} clients={[]} />
        </UserProvider>
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByText('Annuler'));
    await user.click(await screen.findByText('Non'));

    expect(singletonRouter).toMatchObject({ asPath: '/feedbacks/new' });
  });

  it('should display a disabled "Enregistrer" button at first because of mandatory fields', () => {
    render(
      <UserProvider user={adminUser}>
        <NewFeedback ACMAs={[]} employees={[]} accounts={[]} clients={[]} />
      </UserProvider>
    );

    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('should display a warning message when selecting a non consultant hubvisor as admin user', async () => {
    render(NewFeedbackComponent);
    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(screen.getByText(accountManager2.name));

    expect(
      await screen.findByText('Attention cet Hubvisor n’est pas un consultant.')
    ).toBeInTheDocument();
  });

  it('should display a warning message when selecting a non team member hubvisor as manager user', async () => {
    render(
      <UserProvider user={managerUser}>
        <NewFeedback
          ACMAs={manyAccountManagers}
          employees={manyEmployees}
          accounts={manyAccounts}
          clients={manyClients}
        />
      </UserProvider>
    );
    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(screen.getByText(consultant3.name));

    expect(
      await screen.findByText(
        'Cet Hubvisor ne fait pas partie de vos mentorés, une fois créé vous n’aurez plus de visibilité sur ce Feedback.'
      )
    ).toBeInTheDocument();
  });

  it('should enable the "Enregistrer" button when filling mandatory fields', async () => {
    render(NewFeedbackComponent);

    expect(screen.getByText('Ajouter un client')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Nom'));
    await user.click(await screen.findByText('Michael Scott - Dunder-Mifflin'));

    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(screen.getByText('John Doe'));

    await user.type(
      screen.getByLabelText('Quels sont les points forts de l’Hubvisor ?'),
      'positive'
    );
    await user.type(
      screen.getByLabelText("Quels sont les axes d'amélioration de l’Hubvisor sur la mission ?"),
      'improvement'
    );
    await user.type(screen.getByLabelText('Comment se passe la mission ?'), 'context');
    await user.type(
      screen.getByLabelText(
        'Quelles sont les objectifs sur la mission pour les 6 prochains mois ?'
      ),
      'objectives'
    );

    expect(screen.getByText('Enregistrer')).toBeEnabled();
  });

  it('should keep the "Enregistrer" button disabled when the selected date is not in range', async () => {
    render(NewFeedbackComponent);

    expect(screen.getByText('Ajouter un client')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Nom'));
    await user.click(await screen.findByText('Michael Scott - Dunder-Mifflin'));

    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(screen.getByText('John Doe'));

    await user.type(screen.getByLabelText('Date de la prise du feedback'), '2020-01-02');

    await user.type(
      screen.getByLabelText('Quels sont les points forts de l’Hubvisor ?'),
      'positive'
    );
    await user.type(
      screen.getByLabelText("Quels sont les axes d'amélioration de l’Hubvisor sur la mission ?"),
      'improvement'
    );
    await user.type(screen.getByLabelText('Comment se passe la mission ?'), 'context');
    await user.type(
      screen.getByLabelText(
        'Quelles sont les objectifs sur la mission pour les 6 prochains mois ?'
      ),
      'objectives'
    );

    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('should display the error message returned by the API', async () => {
    server.use(
      rest.post('/api/feedbacks', (req, res, ctx) => {
        return res(ctx.status(400), ctx.text("Impossible d'envoyer les données"));
      })
    );

    render(
      <AlertProvider>
        <UserProvider user={adminUser}>
          <NewFeedback
            ACMAs={manyAccountManagers}
            employees={manyEmployees}
            accounts={manyAccounts}
            clients={manyClients}
          />
        </UserProvider>
      </AlertProvider>
    );

    await user.click(screen.getByLabelText('Nom'));
    await user.click(await screen.findByText('Michael Scott - Dunder-Mifflin'));

    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(screen.getByText('John Doe'));

    await user.type(
      screen.getByLabelText('Quels sont les points forts de l’Hubvisor ?'),
      'positive'
    );
    await user.type(
      screen.getByLabelText("Quels sont les axes d'amélioration de l’Hubvisor sur la mission ?"),
      'improvement'
    );
    await user.type(screen.getByLabelText('Comment se passe la mission ?'), 'context');
    await user.type(
      screen.getByLabelText(
        'Quelles sont les objectifs sur la mission pour les 6 prochains mois ?'
      ),
      'objectives'
    );

    await user.click(screen.getByText('Enregistrer'));

    expect(
      await screen.findByText(
        "Nous n'avons pas réussi à enregistrer le feedback : Impossible d'envoyer les données"
      )
    ).toBeInTheDocument();
  });

  it('should redirect to the feedback list page when successfully created', async () => {
    render(NewFeedbackComponent);

    await user.click(screen.getByLabelText('Nom'));
    await user.click(await screen.findByText('Michael Scott - Dunder-Mifflin'));

    await user.click(screen.getByLabelText('Collaborateur'));
    await user.click(await screen.findByText('John Doe'));

    await user.type(
      screen.getByLabelText('Quels sont les points forts de l’Hubvisor ?'),
      'positive'
    );
    await user.type(
      screen.getByLabelText("Quels sont les axes d'amélioration de l’Hubvisor sur la mission ?"),
      'improvement'
    );
    await user.type(screen.getByLabelText('Comment se passe la mission ?'), 'context');
    await user.type(
      screen.getByLabelText(
        'Quelles sont les objectifs sur la mission pour les 6 prochains mois ?'
      ),
      'objectives'
    );

    await user.click(screen.getByText('Enregistrer'));

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({ asPath: `/feedbacks` });
    });
  });
});
