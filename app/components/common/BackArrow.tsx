import { KeyboardEvent, MouseEvent } from 'react';
import styles from 'styles/components/common/BackArrow.module.scss';
import LeftArrow from 'assets/icons/move-arrow-left.svg';

interface BackArrowProps {
  onSelect: (event: MouseEvent | KeyboardEvent) => void;
}

function BackArrow({ onSelect }: BackArrowProps) {
  return (
    <nav>
      <button
        tabIndex={0}
        aria-label="retourner à la page précédente"
        onClick={onSelect}
        onKeyDown={event => event.key === 'Enter' && onSelect(event)}
        className={styles.backArrow}>
        <LeftArrow className={styles.backArrow} />
      </button>
    </nav>
  );
}

export default BackArrow;
