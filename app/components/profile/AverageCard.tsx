import { useMemo } from 'react';
import styles from 'styles/components/profile/AverageCard.module.scss';
import { FullFeedback } from 'types/feedback';
import { getNpsTagClassName, formatDecimalNumber } from 'utils';

const AverageCard = ({ feedbacks }: AverageCardProps) => {
  const averageNps = useMemo(
    () =>
      feedbacks.length
        ? feedbacks.reduce((acc, feedback) => acc + feedback.answers.grade, 0) / feedbacks.length
        : 0,
    [feedbacks]
  );

  return (
    <article className={styles.averageCard}>
      <h3>NPS Moyen</h3>
      <div className={styles.content}>
        {feedbacks.length ? (
          <span className={`${styles.nps} ${styles[getNpsTagClassName(averageNps)]}`}>
            {formatDecimalNumber(averageNps)}/10
          </span>
        ) : (
          <span className={`${styles.nps} ${styles.neutral}`}>Indisponible</span>
        )}
      </div>
    </article>
  );
};

interface AverageCardProps {
  feedbacks: FullFeedback[];
}

export default AverageCard;
