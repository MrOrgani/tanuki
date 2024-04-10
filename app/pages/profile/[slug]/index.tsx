import BackArrow from 'components/common/BackArrow';
import { useRouter } from 'next/router';
import {
  FeedbackSearchQuery,
  FeedbackSortableField,
  FullFeedback,
  PaginatedFeedbacks,
} from 'types/feedback';
import { findSelectedPeriodOption, toStandardDateFormat } from 'utils/date';
import styles from 'styles/pages/profile/[slug].module.scss';
import Head from 'next/head';
import { getFeedbacks } from 'services/feedbacks-service';
import { NextPageContext } from 'next';
import { useState } from 'react';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import { RoleType, User } from '@prisma/client';
import ApplicationError from 'errors/ApplicationError';
import { getEmployeeByEmail } from 'services/employees-service';
import { ErrorCode } from 'types/errors';
import { serializeProps } from 'utils/serialize';
import PeriodSelector from 'components/common/PeriodSelector';
import { DateInterval, PeriodOption } from 'types/date';
import HubvisorCard from 'components/profile/HubvisorCard';
import AverageCard from 'components/profile/AverageCard';
import Button from 'components/common/Button';
import { unslugifyEmployee } from 'utils';
import { FullEmployee } from 'types/employee';
import HubvisorTable from 'components/profile/HubvisorTable';
import useLazyFetch from 'hooks/lazy-fetch';
import { toUrlQuery } from 'utils/urlQuery';
import useComponentUpdate from 'hooks/componentUpdate';
import { getPeriodFilterOptions } from 'services/filters-service';
import { getCookie } from 'utils/cookie';
import { COOKIE_NAME_PERIOD } from 'utils/constants';

const handler = async (ctx: NextPageContext, user: User) => {
  if (!ctx.query.slug) {
    throw new ApplicationError(ErrorCode.BAD_REQUEST, 'Bad parameter', 'Profile');
  }

  const employeeId = unslugifyEmployee(ctx.query.slug.toString());
  const employee = await getEmployeeByEmail(employeeId);
  if (!employee) {
    throw new ApplicationError(ErrorCode.NOT_FOUND, 'No employee found', 'Profile');
  }

  if (user.role === RoleType.manager && employee.managerId !== user.id) {
    throw new ApplicationError(
      ErrorCode.FORBIDDEN,
      "You don't have access to this profile",
      'Profile'
    );
  }

  const periodOptions = await getPeriodFilterOptions({
    default: getCookie(COOKIE_NAME_PERIOD, ctx.req),
    ...(user.role === RoleType.manager ? { manager: user.id } : {}),
  });
  const defaultPeriod = findSelectedPeriodOption(periodOptions);
  const feedbacks = await getFeedbacks({
    employee: employeeId,
    dateFrom: defaultPeriod.range.start,
    dateUntil: defaultPeriod.range.end,
  });

  return {
    props: {
      employee: serializeProps(employee),
      feedbacks: serializeProps(feedbacks),
      periodOptions: serializeProps(periodOptions),
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

function Profile({ employee, feedbacks: feedbackList, periodOptions }: ProfileProps) {
  const router = useRouter();
  const { get } = useLazyFetch();
  const [feedbacks, setFeedbacks] = useState<FullFeedback[]>(feedbackList);
  const [sortBy, setSortBy] = useState(FeedbackSortableField._date);
  const [period, setPeriod] = useState<DateInterval>(findSelectedPeriodOption(periodOptions).range);

  const defineSort = (field: FeedbackSortableField) =>
    setSortBy(sortBy => (sortBy === field ? (`-${field}` as FeedbackSortableField) : field));

  useComponentUpdate(() => {
    const params: FeedbackSearchQuery = {
      q: employee.email,
      start: toStandardDateFormat(new Date(period.start)),
      end: toStandardDateFormat(new Date(period.end)),
      sort: sortBy,
    };

    get(`/api/feedbacks?${toUrlQuery(params)}`)
      .then(res => res.json())
      .then((res: PaginatedFeedbacks) => {
        setFeedbacks(res.feedbacks as FullFeedback[]);
      })
      .catch(err => console.error(err));
  }, [period, sortBy]);

  return (
    <>
      <Head>
        <title>Tanuki - Fiche de {employee.name}</title>
      </Head>
      <main className={styles.profile}>
        <div className={styles.head}>
          <div className={styles.left}>
            <BackArrow onSelect={() => router.back()} />
            <h1>Fiche de {employee.name}</h1>
          </div>
          <div className={styles.right}>
            <PeriodSelector options={periodOptions} onChangePeriod={setPeriod} />
          </div>
        </div>
        <section className={styles.cards}>
          <HubvisorCard hubvisor={employee} />
          <AverageCard feedbacks={feedbacks} />
        </section>
        <section className={styles.tableContainer}>
          <div className={styles.tableHead}>
            <h2>Tableau des Feedbacks</h2>
            <Button
              onClick={() => router.push('/feedbacks/new')}
              type="button"
              stylePreset="contained">
              Nouveau feedback
            </Button>
          </div>
          <div className={styles.table}>
            <HubvisorTable feedbacks={feedbacks} onSort={defineSort} />
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;

export interface ProfileProps {
  employee: FullEmployee;
  feedbacks: FullFeedback[];
  periodOptions: PeriodOption[];
}
