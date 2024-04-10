import styles from 'styles/pages/clients/new.module.scss';
import { Employee } from '@prisma/client';
import { getAccounts } from 'services/accounts-service';
import { getACMAs } from 'services/employees-service';
import { AccountWithACMA } from 'types/account';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import { serializeProps } from 'utils/serialize';
import ClientForm from 'components/client/CientForm';
import Head from 'next/head';
import BackArrow from 'components/common/BackArrow';
import { useConfirmationModal } from 'hooks/modal';
import router from 'next/router';
import { getClients } from 'services/clients-service';
import { Client } from 'types/client';

const handler = async () => {
  const accounts = await getAccounts();
  const ACMAs = await getACMAs({ omitFormerEmployees: true });
  const clients = await getClients();

  return {
    props: {
      ACMAs: serializeProps(ACMAs),
      accounts: serializeProps(accounts),
      clients: serializeProps(clients),
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

function NewClient({ ACMAs, accounts, clients }: NewClientProps) {
  const { createModal, closeModal } = useConfirmationModal();

  const handleCancelCreation = () => {
    createModal({
      title: 'Abandon',
      content: "Êtes-vous sûr.e de vouloir abandonner la création d'un nouveau client ?",
      confirmLabel: 'Oui',
      cancelLabel: 'Non',
      onConfirm: () => {
        closeModal();
        router.push('/clients');
      },
    });
  };

  const handleValidation = () => {
    router.push('/clients?fromcreation=true');
  };

  return (
    <>
      <Head>
        <title>Tanuki - Nouveau client</title>
      </Head>
      <main className={styles.newClientPage}>
        <div className={styles.headerRow}>
          <BackArrow onSelect={handleCancelCreation} />
          <h1>Nouveau client</h1>
        </div>
        <p className={styles.infoMandatory}>Champs obligatoires</p>
        <ClientForm
          ACMAs={ACMAs}
          accounts={accounts}
          clients={clients}
          onCancel={handleCancelCreation}
          onValidation={handleValidation}
        />
      </main>
    </>
  );
}

interface NewClientProps {
  ACMAs: Employee[];
  accounts: AccountWithACMA[];
  clients: Client[];
}

export default NewClient;
