import { ManagerAggregation } from 'types/employee';
import { formatDecimalNumber, getNpsTagClassName } from 'utils';
import { toDisplayDateFormat } from 'utils/date';
import ExpandableContent from './ExpandableContent';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import styles from 'styles/components/dashboard/TableSection.module.scss';
import Avatar from 'components/common/Avatar';
import InfoIcon from 'assets/icons/info.svg';

const ManagerList = ({ managers, expandedItem, handleItemExpansion }: ManagerListProps) => {
  if (!managers.length) {
    return (
      <div className={styles.emptyList}>
        <InfoIcon />
        <span>Aucun résultat ne correspond à votre recherche.</span>
      </div>
    );
  }

  return (
    <ul className={styles.mainList}>
      {managers.map(manager => {
        const key = `row-${manager.id}`;
        const isExpanded = expandedItem === key;
        const ExpandIcon = isExpanded ? ExpandLess : ExpandMore;

        return (
          <li key={key}>
            <div className={`${styles.mainItem} ${isExpanded ? styles.active : ''}`}>
              <span className={styles.expandIcon}>
                <button
                  type="button"
                  onClick={handleItemExpansion(key)}
                  aria-label={isExpanded ? 'réduire' : 'agrandir'}>
                  <ExpandIcon />
                </button>
              </span>
              <div className={styles.col}>
                <span className={styles.colTitle}>HOT</span>
                <div className={styles.employeeWrapper}>
                  <Avatar url={manager.pictureURL} shape="circular" size="xs" />
                  <span>{manager.name}</span>
                </div>
              </div>
              <div className={styles.col}>
                <span className={styles.colTitle}>NPS moyen de l'équipe</span>
                {manager.average ? (
                  <span
                    className={`${styles.npsTag} ${styles[getNpsTagClassName(manager.average)]}`}>
                    {formatDecimalNumber(manager.average)}/10
                  </span>
                ) : (
                  <span className={`${styles.npsTag} ${styles.neutral}`}>Indisponible</span>
                )}
              </div>
              <div className={styles.col}>
                <span className={styles.colTitle}>Nombre de feedbacks de l'équipe</span>
                <span>{manager.count}</span>
              </div>
              <div className={styles.col}>
                <span className={styles.colTitle}>Date dernier entretien</span>
                <span>{manager.date ? toDisplayDateFormat(new Date(manager.date)) : '-'}</span>
              </div>
            </div>
            <ExpandableContent managees={manager.managees} isExpanded={isExpanded} />
          </li>
        );
      })}
    </ul>
  );
};

interface ManagerListProps {
  managers: ManagerAggregation[];
  expandedItem: string | null;
  handleItemExpansion: (key: string) => () => void;
}

export default ManagerList;
