import Head from 'next/head';
import styles from 'styles/pages/Dashboard.module.scss';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import { getFeedbacks } from 'services/feedbacks-service';
import { FullFeedback } from 'types/feedback';
import { serializeProps } from 'utils/serialize';
import KpiSection from 'components/dashboard/KpiSection';
import { findSelectedPeriodOption } from 'utils/date';
import { DateInterval, PeriodOption } from 'types/date';
import { RoleType, Startup, User } from '@prisma/client';
import { FunctionComponent, useState } from 'react';
import PeriodSelector from 'components/common/PeriodSelector';
import Multiselect, { MultiselectProps } from 'components/common/Multiselect';
import TableSection from 'components/dashboard/TableSection';
import { getManagersAggregation } from 'services/employees-service';
import { ManageeFeedbacksAggregation, PaginatedManagersAggregation } from 'types/employee';
import withRoles from 'hooks/withRoles';
import ManagerTableSection from 'components/dashboard/ManagerTableSection';
import { capitalize } from 'utils';
import { NextPageContext } from 'next';
import { COOKIE_NAME_PERIOD, MAIN_ENTITIES } from 'utils/constants';
import { getPeriodFilterOptions } from 'services/filters-service';
import { getCookie } from 'utils/cookie';

const handler = async (ctx: NextPageContext, user: User) => {
  const isManager = user.role === RoleType.manager;
  const periodOptions = await getPeriodFilterOptions({
    default: getCookie(COOKIE_NAME_PERIOD, ctx.req),
    ...(isManager ? { manager: user.id } : {}),
  });
  const {
    range: { start, end },
  } = findSelectedPeriodOption(periodOptions);

  // TODO : get data from client side when loader is implemented
  const feedbacks = await getFeedbacks({
    dateFrom: start,
    dateUntil: end,
    ...(isManager ? { manager: [user.id] } : {}),
  });

  const paginatedManagers = await getManagersAggregation({
    start,
    end,
    ...(isManager ? { managers: [user.id] } : {}),
  });

  return {
    props: {
      feedbacks: serializeProps(feedbacks),
      periodOptions: serializeProps(periodOptions),
      paginatedManagers: !isManager ? serializeProps(paginatedManagers) : [],
      managees:
        isManager && paginatedManagers.totalCount
          ? serializeProps(paginatedManagers.results[0].managees)
          : [],
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

const AdminTable = withRoles(RoleType.admin)(TableSection);
const ManagerTable = withRoles(RoleType.manager)(ManagerTableSection);
const StartupSelector = withRoles(RoleType.admin)(
  Multiselect as FunctionComponent<MultiselectProps<Startup>>
);

export default function Dashboard({
  feedbacks,
  periodOptions,
  paginatedManagers,
  managees,
}: DashboardProps) {
  const [entities, setEntities] = useState<Startup[]>([]);
  const [period, setPeriod] = useState<DateInterval>(findSelectedPeriodOption(periodOptions).range);

  return (
    <>
      <Head>
        <title>Tanuki - Dashboard</title>
      </Head>
      <main className={styles.mainContainer}>
        <div className={styles.head}>
          <h1>Bienvenue sur Tanuki,</h1>
          <div className={styles.filters}>
            <StartupSelector
              label="Sélectionner une entité"
              options={MAIN_ENTITIES}
              defaultValues={entities}
              getOptionLabel={option => capitalize(option)}
              handleChange={setEntities}
              id="entity"
              theme="primary"
            />
            <PeriodSelector
              onChangePeriod={(interval: DateInterval) => setPeriod(interval)}
              options={periodOptions}
              className={styles.periodSelector}
            />
          </div>
        </div>
        <KpiSection initialData={feedbacks} period={period} entities={entities} />
        <AdminTable
          initialData={paginatedManagers}
          period={period}
          entities={entities}
          periodOptions={periodOptions}
        />
        <ManagerTable initialData={managees} period={period} periodOptions={periodOptions} />
      </main>
    </>
  );
}

interface DashboardProps {
  feedbacks: FullFeedback[];
  periodOptions: PeriodOption[];
  paginatedManagers: PaginatedManagersAggregation;
  managees: ManageeFeedbacksAggregation[];
}
