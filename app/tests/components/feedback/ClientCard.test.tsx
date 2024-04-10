import { render, screen } from '@testing-library/react';
import ClientCard from 'components/feedback/ClientCard';
import { singleClient } from 'mockData/clients';

describe('The ClientCard component', () => {
  it("should display with the current client's informations", () => {
    expect.assertions(3);
    render(<ClientCard client={singleClient} />);
    expect(screen.getByText(singleClient.account.name)).toBeInTheDocument();
    expect(screen.getByText(singleClient.name)).toBeInTheDocument();
    expect(screen.getByText(singleClient.email)).toBeInTheDocument();
  });
});
