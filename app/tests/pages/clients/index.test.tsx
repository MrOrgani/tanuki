import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import singletonRouter from 'next/router';
import { AlertProvider } from 'components/common/Alert/AlertProvider';
import { manyClients } from 'mockData/clients';
import { adminUser } from 'mockData/users';
import { serializeProps } from 'utils/serialize';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const mockGetClients = jest.fn();
jest.mock('services/clients-service.ts', () => ({
  getClients: mockGetClients,
}));

describe('The AdminClients page getServerSideProps', () => {
  const { getServerSideProps } = require('pages/clients');

  it('should retrieve clients data and pass it as props', async () => {
    mockGetClients.mockResolvedValue(manyClients);
    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
    });

    expect(response.props.clients).toStrictEqual(serializeProps(manyClients));
  });
});

describe('The AdminClients page component', () => {
  const AdminClients = require('pages/clients').default;

  it('should render a table with the proper headers to describe a clients list', () => {
    render(<AdminClients clients={manyClients} />);
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
    expect(screen.getByText('ACMA')).toBeInTheDocument();
  });

  it('should render a table with the proper data ', () => {
    render(<AdminClients clients={manyClients} />);
    expect(screen.getByText(manyClients[0].name)).toBeInTheDocument();
    expect(screen.getByText(manyClients[1].name)).toBeInTheDocument();
    expect(screen.getByText(manyClients[0].email)).toBeInTheDocument();
    expect(screen.getByText(manyClients[1].email)).toBeInTheDocument();
    expect(screen.getByText(manyClients[0].account.name)).toBeInTheDocument();
    expect(screen.getByText(manyClients[1].account.name)).toBeInTheDocument();
  });

  it('should display a Nouveau client button leading to the client creation page', async () => {
    render(<AdminClients clients={manyClients} />);

    userEvent.click(screen.getByText('Nouveau client'));
    await waitFor(() => expect(singletonRouter).toMatchObject({ asPath: '/clients/new' }));
  });

  it('should display an info snackbar if user has just created a new client', async () => {
    singletonRouter.push('/clients?fromcreation=true');
    render(
      <AlertProvider>
        <AdminClients clients={manyClients} />
      </AlertProvider>
    );
    expect(await screen.findByText('Le client a été créé avec succès.')).toBeInTheDocument();
  });
});
