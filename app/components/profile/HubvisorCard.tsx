import Avatar from 'components/common/Avatar';
import styles from 'styles/components/profile/HubvisorCard.module.scss';
import { FullEmployee } from 'types/employee';
import { toDisplayDateFormat } from 'utils/date';

const HubvisorCard = ({ hubvisor }: HubvisorCardProps) => {
  return (
    <article className={styles.hubvisorCard}>
      <h3>Hubvisor</h3>
      <div className={styles.content}>
        <div className={styles.left}>
          <Avatar shape="circular" size="xl" url={hubvisor.pictureURL} />
        </div>
        <div className={styles.right}>
          <span className={styles.name}>{hubvisor.name}</span>
          <span>{hubvisor.position}</span>
          {hubvisor.contractStartDate && (
            <span className={styles.date}>
              Arrivé le {toDisplayDateFormat(new Date(hubvisor.contractStartDate))}
            </span>
          )}
          {hubvisor.manager && (
            <span className={styles.manager}>
              <span className={styles.bold}>HoT : </span>
              {hubvisor.manager.name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

interface HubvisorCardProps {
  hubvisor: FullEmployee;
}

export default HubvisorCard;
