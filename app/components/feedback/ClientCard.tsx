import styles from 'styles/components/feedback/ClientCard.module.scss';
import { Account, Client } from '@prisma/client';

interface ClientCardData {
  client: (Client & { account: Account }) | null;
}

function ClientCard({ client }: ClientCardData) {
  return (
    <div className={styles.clientCard}>
      <h3>Client</h3>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>
            <span className={styles.infoType}>Compte : </span>
            <span className={client ? '' : styles.unspecified}>
              {client?.account.name || 'Non renseigné'}
            </span>
          </p>
          <p>
            <span className={styles.infoType}>Interlocuteur : </span>
            <span className={client ? '' : styles.unspecified}>
              {client?.name || 'Non renseigné'}
            </span>
          </p>
          <p>
            <span className={styles.infoType}>Email : </span>
            <span className={client?.email ? '' : styles.unspecified}>
              {client?.email || 'Non renseigné'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientCard;
