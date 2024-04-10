import { Employee } from '@prisma/client';
import { Client } from 'types/client';
import { AccountWithACMA } from 'types/account';
import ClientForm from 'components/client/CientForm';
import styles from 'styles/components/modals/ClientFormModal.module.scss';

const ClientFormModal = ({
  ACMAs,
  accounts,
  clients,
  closeModal,
  onValidation,
}: ClientFormModalProps) => {
  return (
    <div className={styles.modal}>
      <h2>Nouveau client</h2>
      <p className={styles.infoMandatory}>Champs obligatoires</p>
      <ClientForm
        accounts={accounts}
        ACMAs={ACMAs}
        clients={clients}
        onCancel={closeModal}
        onValidation={onValidation}
      />
    </div>
  );
};

export interface ClientFormModalProps {
  ACMAs: Employee[];
  accounts: AccountWithACMA[];
  clients: Client[];
  closeModal: () => void;
  onValidation: (data: Client) => void;
}

export default ClientFormModal;
