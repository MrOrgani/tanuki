import { render, screen, waitFor } from '@testing-library/react';

import { handlers } from 'mocks/handlers';

describe('The Avatar component', () => {
  const Avatar = jest.requireActual('components/common/Avatar').default;
  require('tests/test-utils').startMsw(handlers);

  it('should display the default avatar when the picture url was not found', async () => {
    render(<Avatar url="/images/not_valid_path.svg" />);
    waitFor(() => {
      expect(screen.getByAltText('Avatar par défaut')).toBeInTheDocument();
    });
  });

  it('should display the default avatar when no picture url is provided', async () => {
    render(<Avatar />);
    expect(await screen.findByAltText('Avatar par défaut')).toBeInTheDocument();
  });

  it("should display the hubvisor's picture when a picture url is provided", async () => {
    render(<Avatar url="/images/hubvisor.svg" />);
    expect(await screen.findByAltText("Avatar de l'employé")).toBeInTheDocument();
  });
});
