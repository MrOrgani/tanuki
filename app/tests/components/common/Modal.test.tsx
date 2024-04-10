import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmationModal } from 'hooks/modal';
import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

function ModalCreationButton() {
  const { createModal, closeModal } = useConfirmationModal();
  return (
    <button
      onClick={() => {
        createModal({
          title: 'Titre',
          content: 'Êtes vous sûr ?',
          confirmLabel: 'bien sûr',
          cancelLabel: 'annuler',
          onConfirm: closeModal,
          onCancel: closeModal,
        });
      }}>
      Afficher la modale
    </button>
  );
}

function ModalWithInputCreationButton() {
  const { createModal, closeModal } = useConfirmationModal();
  return (
    <button
      onClick={() => {
        createModal({
          title: 'Titre',
          content: (
            <>
              <label htmlFor="text-input">Complétez ce champ</label>
              <input id="text-input" type="text" />{' '}
            </>
          ),
          confirmLabel: 'bien sûr',
          cancelLabel: 'annuler',
          onConfirm: closeModal,
          onCancel: closeModal,
        });
      }}>
      Afficher la modale
    </button>
  );
}

function LabellessModalCreationButton() {
  const { createModal } = useConfirmationModal();
  return (
    <button
      onClick={() => {
        createModal({
          title: 'Modale',
          content: 'Êtes vous sûr de ça ?',
          onConfirm: () => {},
          onCancel: () => {},
        });
      }}>
      Afficher la modale
    </button>
  );
}

describe('The modal component', () => {
  const displayModal = async () => {
    render(
      <ConfirmationModalProvider>
        <ModalCreationButton />
      </ConfirmationModalProvider>
    );
    await userEvent.click(screen.getByText('Afficher la modale'));
  };

  it('should display with the text and title passed as props when button is clicked', async () => {
    expect.assertions(3);

    await displayModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Titre')).toBeInTheDocument();
    expect(screen.getByText('Êtes vous sûr ?')).toBeInTheDocument();
  });

  it('should display with the textbox passed as props when button is clicked', async () => {
    render(
      <ConfirmationModalProvider>
        <ModalWithInputCreationButton />
      </ConfirmationModalProvider>
    );

    userEvent.click(screen.getByText('Afficher la modale'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Complétez ce champ')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display the button labels passed as props', async () => {
    expect.assertions(2);

    await displayModal();
    expect(screen.getByText('bien sûr')).toBeInTheDocument();
    expect(screen.getByText('annuler')).toBeInTheDocument();
  });

  it('should display the default button labels when no props are passed for button labels', async () => {
    expect.assertions(2);

    render(
      <ConfirmationModalProvider>
        <LabellessModalCreationButton />
      </ConfirmationModalProvider>
    );
    await userEvent.click(screen.getByText('Afficher la modale'));
    expect(screen.getByText('Non')).toBeInTheDocument();
    expect(screen.getByText('Oui')).toBeInTheDocument();
  });

  it('should close modal upon selecting the cancel button', async () => {
    expect.assertions(1);

    await displayModal();
    await userEvent.click(screen.getByText('annuler'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close modal upon selecting the confirm button', async () => {
    expect.assertions(1);

    await displayModal();
    await userEvent.click(screen.getByText('bien sûr'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
