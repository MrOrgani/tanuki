/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { getClients } from 'services/clients-service';
import Button from 'components/common/Button';
import { useRouter } from 'next/router';
import Table, { Column } from 'components/common/Table';
import { Client } from 'types/client';
import styles from 'styles/pages/clients/index.module.scss';
import { useAlert } from 'components/common/Alert/AlertProvider';
import { useEffect } from 'react';
import { serializeProps } from 'utils/serialize';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';

const handler = async () => {
  const clients = await getClients();
  return { props: { clients: serializeProps(clients) } };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

export default function AdminClients({ clients }: Props) {
  const router = useRouter();
  const { createAlert } = useAlert();

  useEffect(() => {
    if (router.query.fromcreation === 'true') {
      createAlert('info', 'Le client a été créé avec succès.');
    }
  }, []);

  const tableColumns: Column<Client>[] = [
    { label: 'Nom', propertyName: 'name', renderer: data => data.name },
    {
      label: 'Compte',
      propertyName: 'accountName',
      renderer: data => data.account.name,
    },
    {
      label: 'ACMA',
      propertyName: 'accountManagerName',
      renderer: data => data.account.accountManager?.name || '-',
    },
    {
      label: 'Email',
      propertyName: 'email',
      renderer: data => data.email || '-',
    },
  ];

  return (
    <>
      <Head>
        <title>Tanuki - Clients</title>
      </Head>
      <main className={styles.clientsPage}>
        <div className={styles.head}>
          <h1>Clients</h1>
          <Button onClick={() => router.push('/clients/new')}>Nouveau client</Button>
        </div>
        <Table
          uniqueKeyPrefix="client-table"
          data={clients}
          columns={tableColumns}
          stickyHeader={true}
          url={client => `/clients/${client.id}`}
        />
      </main>
    </>
  );
}

interface Props {
  clients: Client[];
}
