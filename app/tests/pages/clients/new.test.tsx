import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';
import singletonRouter from 'next/router';
import { AlertProvider } from 'components/common/Alert/AlertProvider';
import { manyClients } from 'mockData/clients';
import { manyAccountManagers } from 'mockData/employees';
import { manyAccounts } from 'mockData/accounts';
import { adminUser } from 'mockData/users';
import { serializeProps } from 'utils/serialize';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const mockGetClients = jest.fn();
const mockGetEmployees = jest.fn();
const mockGetACMAs = jest.fn();
const mockGetAccounts = jest.fn();
jest.mock('services/clients-service', () => ({
  getClients: mockGetClients,
}));
jest.mock('services/employees-service', () => ({
  getEmployees: mockGetEmployees,
  getACMAs: mockGetACMAs,
}));
jest.mock('services/accounts-service', () => ({
  getAccounts: mockGetAccounts,
}));

describe('the client creation page getServerSideProps', () => {
  const { getServerSideProps } = require('pages/clients/new');

  it('should retrieve clients data and pass their ACMAs and accounts as props', async () => {
    mockGetClients.mockResolvedValue(manyClients);
    mockGetACMAs.mockResolvedValue(manyAccountManagers);
    mockGetAccounts.mockResolvedValue(manyAccounts);

    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
    });

    expect(response.props.ACMAs).toStrictEqual(serializeProps(manyAccountManagers));
    expect(response.props.accounts).toStrictEqual(serializeProps(manyAccounts));
  });
});

describe('the client creation page', () => {
  const NewClient = require('pages/clients/new').default;
  const user = userEvent.setup();

  beforeEach(() => {
    singletonRouter.push('/clients/new');
  });

  it('should render with its title', () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    expect(screen.getByText('Nouveau client')).toBeInTheDocument();
  });

  it('should display a disabled Créer le client button', () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('should display two accounts inside the combobox', async () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    await user.click(screen.getByLabelText('Compte'));

    expect(await screen.findByText(manyAccounts[0].name)).toBeInTheDocument();
    expect(screen.getByText(manyAccounts[1].name)).toBeInTheDocument();
  });

  it('should display one option on user query, the account creation message should disappear if it is selected', async () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    await user.click(screen.getByLabelText('Compte'));

    expect(await screen.findByText(manyAccounts[0].name)).toBeInTheDocument();
    expect(screen.getByText(manyAccounts[1].name)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Compte'), manyAccounts[1].name.slice(0, 3));
    await user.click(await screen.findByText(manyAccounts[1].name));

    await waitFor(() => expect(screen.queryByText('sera créé')).not.toBeInTheDocument());
  });

  it('should display two ACMAs inside the combobox, selecting one displays them inside the textbox', async () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    await user.click(screen.getByLabelText('ACMA'));
    expect(screen.getByText(manyAccountManagers[0].name)).toBeInTheDocument();
    expect(screen.getByText(manyAccountManagers[1].name)).toBeInTheDocument();

    await user.click(screen.getByText(manyAccountManagers[0].name));
    expect(screen.getByDisplayValue(manyAccountManagers[0].name)).toBeInTheDocument();
  });

  it('should return to the clients list upon clicking "annuler" and selecting "oui" on the modal window', async () => {
    render(
      <ConfirmationModalProvider>
        <NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByText('Annuler'));
    expect(screen.getByText('Abandon')).toBeInTheDocument();
    await user.click(screen.getByText('Oui'));

    expect(singletonRouter).toMatchObject({ asPath: '/clients' });
  });

  it('should stay on the page upon clicking "annuler" and selecting "non" on the modal window', async () => {
    render(
      <ConfirmationModalProvider>
        <NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByText('Annuler'));
    await user.click(screen.getByText('Non'));

    expect(singletonRouter).toMatchObject({ asPath: '/clients/new' });
  });

  it('should return to the homepage upon clicking the back arrow and selecting "oui" on the modal window', async () => {
    render(
      <ConfirmationModalProvider>
        <NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByLabelText('retourner à la page précédente'));
    expect(screen.getByText('Abandon')).toBeInTheDocument();
    await user.click(screen.getByText('Oui'));

    expect(singletonRouter).toMatchObject({ asPath: '/clients' });
  });

  it('should stay on the page upon clicking the back arrow and selecting "non" on the modal window', async () => {
    render(
      <ConfirmationModalProvider>
        <NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />
      </ConfirmationModalProvider>
    );

    await user.click(screen.getByLabelText('retourner à la page précédente'));
    await user.click(screen.getByText('Non'));

    expect(singletonRouter).toMatchObject({ asPath: '/clients/new' });
  });

  it('should only enable the Enregistrer button when the account, name, email and acma inputs are filled out', async () => {
    render(<NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />);

    await user.type(screen.getByLabelText('Compte'), 'aabbcc');
    expect(screen.getByText('Enregistrer')).toBeDisabled();

    await user.type(screen.getByLabelText('Interlocuteur'), 'bbccdd');
    expect(screen.getByText('Enregistrer')).toBeDisabled();

    await user.type(screen.getByLabelText('Email'), 'ccddee');
    expect(screen.getByText('Enregistrer')).toBeDisabled();

    await user.click(screen.getByLabelText('ACMA'));
    await user.click(screen.getByText(manyAccountManagers[0].name));
    expect(screen.getByText('Enregistrer')).not.toBeDisabled();
  });

  it('should display an alert if there was an error creating client', async () => {
    render(
      <AlertProvider>
        <NewClient ACMAs={manyAccountManagers} accounts={manyAccounts} clients={manyClients} />
      </AlertProvider>
    );

    await user.type(screen.getByLabelText('Compte'), 'Chanel');
    await user.type(screen.getByLabelText('Interlocuteur'), 'yannock labanniere');
    await user.type(screen.getByLabelText('Email'), 'michael@dundermifflin.com');

    expect(await screen.findByText('Cette adresse email existe déjà')).toBeInTheDocument();
  });
});
