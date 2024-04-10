import Avatar from 'components/common/Avatar';
import styles from 'styles/components/feedback/HubCard.module.scss';
import { Employee } from '@prisma/client';
import { toDisplayDateFormat } from 'utils/date';
import Button from 'components/common/Button';
import router from 'next/router';
import { slugifyEmployee } from 'utils';

interface HubCardData {
  employee: Employee;
}

function HubCard({ employee }: HubCardData) {
  return (
    <div className={styles.hubCard}>
      <h3>Hubvisor</h3>
      <div className={styles.container}>
        <div>
          <Avatar url={employee.pictureURL} size="xl" shape="circular" />
        </div>
        <div className={styles.content}>
          <span className={styles.hubName}>{employee.name}</span>
          <span className={styles.hubPosition}>{employee.position}</span>
          {employee.contractStartDate && (
            <span className={styles.hubArrival}>
              Arrivé le {toDisplayDateFormat(new Date(employee.contractStartDate))}
            </span>
          )}
          <Button
            onClick={() => router.push(`/profile/${slugifyEmployee(employee.id)}`)}
            type="button"
            stylePreset="contained">
            Voir la fiche
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HubCard;
