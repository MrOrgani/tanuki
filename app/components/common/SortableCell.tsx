import styles from 'styles/components/common/SortableCell.module.scss';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

interface SortableCellProps {
  label: string;
  ariaLabel?: string;
  onSort: () => void;
}

const SortableCell = ({ label, ariaLabel, onSort }: SortableCellProps) => (
  <div className={styles.sortableCell}>
    <button
      className={styles.sortBtn}
      aria-label={ariaLabel || `Trier par ${label}`}
      onClick={onSort}>
      <span className={styles.label}>{label}</span>
      <span className={styles.icon}>
        <ArrowDropUpIcon className={styles.iconUp} fontSize="small" />
        <ArrowDropDownIcon className={styles.iconDown} fontSize="small" />
      </span>
    </button>
  </div>
);

export default SortableCell;
