import { render, screen } from '@testing-library/react';
import UserProvider from 'contexts/user';
import { managerUser } from 'mockData/users';

describe('the UserCard component', () => {
  const UserCard = require('components/UserCard').default;

  it("should display the provided user's name", async () => {
    render(
      <UserProvider user={managerUser}>
        <UserCard />
      </UserProvider>
    );
    expect(screen.getByText(managerUser.name)).toBeInTheDocument();
  });

  it("should display the provided user's email", async () => {
    render(
      <UserProvider user={managerUser}>
        <UserCard />
      </UserProvider>
    );
    expect(screen.getByText(managerUser.email)).toBeInTheDocument();
  });

  it("should display the provided user's picture", async () => {
    render(
      <UserProvider user={managerUser}>
        <UserCard />
      </UserProvider>
    );
    expect(screen.getByText('Mocked Avatar Component')).toBeInTheDocument();
  });
});
