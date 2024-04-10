import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProvider from 'contexts/user';
import { managerUser } from 'mockData/users';
import singletonRouter from 'next/dist/client/router';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('The navigation menu', () => {
  const NavigationMenu = require('components/Navigation/NavigationMenu').default;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with the "Dashboard" button selected by default', async () => {
    singletonRouter.push('/');
    render(<NavigationMenu />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });

  it('should not navigate away from the homepage when clicking the Tanuki logo', async () => {
    expect.assertions(1);

    render(<NavigationMenu />);

    userEvent.click(screen.getByText('Tanuki'));
    await waitFor(async () => {
      expect(singletonRouter).toMatchObject({ asPath: '/' });
    });
  });

  it('should not navigate away from the homepage when clicking "Dashboard"', async () => {
    expect.assertions(1);

    render(<NavigationMenu />);

    userEvent.click(screen.getByText('Dashboard'));
    await waitFor(async () => {
      expect(singletonRouter).toMatchObject({ asPath: '/' });
    });
  });

  it('should display a "Clients" navigation link which highlights when navigating to the clients page', async () => {
    render(<NavigationMenu />);
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('should go to the clients page when clicking on the clients navigation link', async () => {
    render(<NavigationMenu />);
    userEvent.click(screen.getByText('Clients'));

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({ asPath: '/clients' });
    });
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('aria-current', 'page');
  });

  it('should go to the feedbacks page when clicking on the feedbacks navigation link', async () => {
    render(<NavigationMenu />);
    userEvent.click(screen.getByText('Feedbacks'));

    await waitFor(() => {
      expect(singletonRouter).toMatchObject({ asPath: '/feedbacks' });
    });
    expect(screen.getByRole('link', { name: 'Feedbacks' })).toHaveAttribute('aria-current', 'page');
  });

  it('should be displaying a user card', async () => {
    render(
      <UserProvider user={managerUser}>
        <NavigationMenu />
      </UserProvider>
    );
    expect(screen.getByText(managerUser.email)).toBeInTheDocument();
  });
});
