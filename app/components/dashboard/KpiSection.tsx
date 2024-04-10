import Avatar from 'components/common/Avatar';
import { useMemo, useState, MouseEvent } from 'react';
import { FullFeedback, PaginatedFeedbacks } from 'types/feedback';
import styles from 'styles/components/dashboard/KpiSection.module.scss';
import { formatDecimalNumber, getNpsTagClassName } from 'utils';
import { DateInterval } from 'types/date';
import { Startup } from '@prisma/client';
import useComponentUpdate from 'hooks/componentUpdate';
import useLazyFetch from 'hooks/lazy-fetch';
import { toUrlQuery } from 'utils/urlQuery';
import { toStandardDateFormat } from 'utils/date';
import { useRouter } from 'next/router';
import InfoIcon from 'assets/icons/info.svg';

const KpiSection = ({ initialData, period, entities }: KpiSectionProps) => {
  const [feedbacks, setFeedbacks] = useState(initialData);
  const { get } = useLazyFetch();
  const feedbackCount = feedbacks.length;
  const router = useRouter();
  const averageNPS = useMemo(
    () =>
      feedbackCount
        ? feedbacks.reduce((acc, feedback) => acc + feedback.answers.grade, 0) / feedbackCount
        : 0,
    [feedbacks, feedbackCount]
  );

  const npsAlerts = useMemo(
    () => feedbacks.filter(feedback => feedback.answers.grade < 7),
    [feedbacks]
  );

  const redirectToFeedback = (feedbackId: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(`/feedbacks/${feedbackId}`);
  };

  useComponentUpdate(() => {
    const params = {
      start: toStandardDateFormat(new Date(period.start)),
      end: toStandardDateFormat(new Date(period.end)),
      startup: entities,
    };

    get(`/api/feedbacks?${toUrlQuery(params)}`)
      .then(res => res.json())
      .then((res: PaginatedFeedbacks) => setFeedbacks(res.feedbacks))
      .catch(err => {
        setFeedbacks(initialData);
        console.error(err);
      });
  }, [period, entities]);

  return (
    <section className={styles.kpiSection}>
      <h2>Données sur la période en cours</h2>
      <div className={styles.cardsContainer}>
        <article className={styles.card}>
          <h3>Feedbacks</h3>
          <div className={styles.cardContent}>
            {feedbackCount > 0 ? (
              <span data-testid="kpi-count" className={`${styles.taggedValue} ${styles.neutral}`}>
                {feedbackCount}
              </span>
            ) : (
              <EmptyPlaceholder id="kpi-count" />
            )}
          </div>
        </article>
        <article className={styles.card}>
          <h3>NPS moyen</h3>
          <div className={styles.cardContent}>
            {feedbackCount > 0 ? (
              <span
                data-testid="kpi-average"
                className={`${styles.taggedValue} ${styles[getNpsTagClassName(averageNPS)]}`}>
                {formatDecimalNumber(averageNPS)}/10
              </span>
            ) : (
              <EmptyPlaceholder id="kpi-average" />
            )}
          </div>
        </article>
        <article className={styles.card}>
          <h3>NPS insuffisant</h3>
          <div className={styles.cardContent}>
            {npsAlerts.length > 0 ? (
              <ul className={styles.cardList}>
                {npsAlerts.map(feedback => (
                  <li key={feedback.id}>
                    <a
                      href=""
                      onClick={redirectToFeedback(feedback.id)}
                      className={styles.listItem}>
                      <span className={styles.itemNps}>
                        {formatDecimalNumber(feedback.answers.grade)}/10
                      </span>
                      <span className={styles.employeeInfo}>
                        <Avatar size={'s'} shape={'circular'} url={feedback.employee.pictureURL} />
                        {feedback.employee.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyPlaceholder id="kpi-alerts" text={"Il n'y a pas encore d'alerte."} />
            )}
          </div>
        </article>
      </div>
    </section>
  );
};

const EmptyPlaceholder = ({ id, text }: EmptyPlaceholderProps) => (
  <div className={styles.centered}>
    <span>
      <InfoIcon />
    </span>
    <span data-testid={id}>{text || "Il n'y a pas encore de feedback."}</span>
  </div>
);

interface KpiSectionProps {
  initialData: FullFeedback[];
  period: DateInterval;
  entities: Startup[];
}

interface EmptyPlaceholderProps {
  id: string;
  text?: string | null;
}

export default KpiSection;
