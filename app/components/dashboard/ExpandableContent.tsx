import Collapse from '@mui/material/Collapse';
import { ManageeFeedbacksAggregation } from 'types/employee';
import { formatDecimalNumber, getNpsTagClassName, slugifyEmployee } from 'utils';
import { toDisplayDateFormat } from 'utils/date';
import InfoIcon from 'assets/icons/info.svg';
import Avatar from 'components/common/Avatar';
import styles from 'styles/components/dashboard/TableSection.module.scss';
import Link from 'next/link';

const ExpandableContent = ({ managees, isExpanded }: ExpandableContentProps) => {
  if (!managees.length) {
    return (
      <Collapse in={isExpanded} mountOnEnter>
        <div className={styles.emptyInnerList}>
          <p>
            <InfoIcon />
            Ce Hot n'a pas encore de membre dans sa team.
          </p>
        </div>
      </Collapse>
    );
  }

  return (
    <Collapse in={isExpanded} mountOnEnter>
      <ul className={styles.innerList}>
        {managees.map(managee => (
          <li key={managee.id}>
            <Link href={`/profile/${slugifyEmployee(managee.id)}`}>
              <a className={styles.innerItem}>
                <span className={styles.expandIcon}></span>
                <div className={styles.col}>
                  <div className={styles.employeeWrapper}>
                    <Avatar url={managee.pictureURL} shape="circular" size="xs" />
                    <span>{managee.name}</span>
                  </div>
                </div>
                <div className={styles.col}>
                  {managee.average ? (
                    <span
                      className={`${styles.npsTag} ${styles[getNpsTagClassName(managee.average)]}`}>
                      {formatDecimalNumber(managee.average)}/10
                    </span>
                  ) : (
                    <span className={`${styles.npsTag} ${styles.neutral}`}>Indisponible</span>
                  )}
                </div>
                <div className={styles.col}>
                  <span>{managee.count}</span>
                </div>
                <div className={styles.col}>
                  <span>{managee.date ? toDisplayDateFormat(new Date(managee.date)) : '-'}</span>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </Collapse>
  );
};

interface ExpandableContentProps {
  managees: ManageeFeedbacksAggregation[];
  isExpanded: boolean;
}

export default ExpandableContent;
