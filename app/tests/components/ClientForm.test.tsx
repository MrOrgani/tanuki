/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { manyAccountManagers } from 'mockData/employees';
import { manyAccounts } from 'mockData/accounts';
import ClientForm from 'components/client/CientForm';
import { manyClients } from 'mockData/clients';

describe('The ClientForm component', () => {
  const ClientFormComponent = (
    <ClientForm
      ACMAs={manyAccountManagers}
      accounts={manyAccounts}
      clients={manyClients}
      onCancel={() => {}}
      onValidation={() => {}}
    />
  );
  const user = userEvent.setup();

  it('should display the client form with all fields', async () => {
    render(ClientFormComponent);

    expect(screen.getByText('Compte')).toBeInTheDocument();
    expect(screen.getByText('Interlocuteur')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('ACMA')).toBeInTheDocument();
    expect(screen.getByText('Autres informations')).toBeInTheDocument();
    expect(screen.getByText('Enregistrer')).toBeDisabled();
  });

  it('should display enable "Enregistrer" button when filling all the required fields', async () => {
    render(ClientFormComponent);

    await user.click(screen.getByLabelText('Compte'));
    await user.click(await screen.findByText(manyAccounts[0].name));
    await user.type(screen.getByLabelText('Interlocuteur'), 'name test');
    await user.type(screen.getByLabelText('Email'), 'test@test.fr');

    expect(screen.getByText('Enregistrer')).toBeEnabled();
  });

  it('should display an error message when the email is already taken', async () => {
    render(ClientFormComponent);

    await user.click(screen.getByLabelText('Compte'));
    await user.click(await screen.findByText(manyAccounts[0].name));

    // With case sensitive testing
    await user.type(screen.getByLabelText('Email'), manyClients[0].email!.toUpperCase());

    expect(await screen.findByText('Cette adresse email existe déjà')).toBeInTheDocument();
  });

  it('should display an error message when the client name is already taken', async () => {
    render(ClientFormComponent);

    await user.click(screen.getByLabelText('Compte'));
    await user.click(await screen.findByText(manyAccounts[0].name));

    // With case sensitive testing
    await user.type(screen.getByLabelText('Interlocuteur'), manyClients[0].name.toUpperCase());

    expect(
      await screen.findByText('Cet interlocuteur est déjà associé à un compte client')
    ).toBeInTheDocument();
  });

  it('should display an enabled "ACMA" field by default', async () => {
    render(ClientFormComponent);
    expect(screen.getByLabelText('ACMA')).toBeEnabled();
  });

  it('should disable and fill in the "ACMA" field automatically when selecting a "Compte"', async () => {
    render(ClientFormComponent);

    await user.click(screen.getByLabelText('Compte'));
    await user.click(await screen.findByText(manyAccounts[0].name));

    await waitFor(() => {
      expect(screen.getByLabelText('ACMA')).toBeDisabled();
      expect(screen.getByLabelText('ACMA')).toHaveDisplayValue(
        manyAccounts[0].accountManager!.name
      );
    });
  });

  it('should disable and fill in the "ACMA" field automatically when typing an existing account', async () => {
    render(ClientFormComponent);

    // With case sensitive testing
    await user.type(screen.getByLabelText('Compte'), manyAccounts[0].name.toUpperCase());

    await waitFor(() => {
      expect(screen.getByLabelText('ACMA')).toBeDisabled();
      expect(screen.getByLabelText('ACMA')).toHaveDisplayValue(
        manyAccounts[0].accountManager!.name
      );
    });
  });
});
