import { act, render, screen } from '@testing-library/react';
import ErrorComponent from 'components/Error';
import singletonRouter from 'next/router';
import userEvent from '@testing-library/user-event';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('The Error Component', () => {
  const user = userEvent.setup();

  beforeEach(() => singletonRouter.push('/500'));

  it('should display an error code, description', () => {
    render(
      <ErrorComponent
        code={500}
        details="La ressource demandée ne peut pas être affichée à cause d'une erreur du serveur."
      />
    );

    expect(screen.getByText('Erreur 500')).toBeInTheDocument();
    expect(
      screen.getByText(
        "La ressource demandée ne peut pas être affichée à cause d'une erreur du serveur."
      )
    ).toBeInTheDocument();
  });

  it('should display an "Dashboard" button which should redirect to the front page', async () => {
    render(
      <ErrorComponent
        code={500}
        details="La ressource demandée ne peut pas être affichée à cause d'une erreur du serveur."
      />
    );

    const frontPageButton = screen.getByRole('button', { name: 'Dashboard' });

    expect(frontPageButton).toBeInTheDocument();
    await act(() => user.click(frontPageButton));

    expect(singletonRouter).toMatchObject({
      asPath: `/`,
    });
  });

  // next-router-mock currently doesn't work with router.back(): https://www.npmjs.com/package/next-router-mock#a-fully-working-jest-example
  it('should display a "Retourner à la page précédente" button which should take the user back to previous page', async () => {
    render(
      <ErrorComponent
        code={500}
        details="La ressource demandée ne peut pas être affichée à cause d'une erreur du serveur."
      />
    );

    const backButton = screen.getByRole('button', { name: 'Page précédente' });

    expect(backButton).toBeInTheDocument();
  });
});
