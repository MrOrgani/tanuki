/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { Employee, RoleType, Startup, User } from '@prisma/client';
import styles from 'styles/pages/feedbacks/index.module.scss';
import { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import { getFeedbacks } from 'services/feedbacks-service';
import {
  FeedbackSearchQuery,
  FeedbackSortableField,
  FullFeedback,
  PaginatedFeedbacks,
  SerializedFeedback,
} from 'types/feedback';
import Button from 'components/common/Button';
import TextInput from 'components/common/TextInput';
import InputAdornment from '@mui/material/InputAdornment';
import Search from '@mui/icons-material/Search';
import useLazyFetch from 'hooks/lazy-fetch';
import { useRouter } from 'next/router';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import Table, { Column } from 'components/common/Table';
import { getManagers } from 'services/employees-service';
import Avatar from 'components/common/Avatar';
import { toUrlQuery } from 'utils/urlQuery';
import SortableCell from 'components/common/SortableCell';
import Paginator from 'components/common/Paginator';
import { findSelectedPeriodOption, toStandardDateFormat } from 'utils/date';
import { serializeProps } from 'utils/serialize';
import { DateInterval, PeriodOption } from 'types/date';
import PeriodSelector from 'components/common/PeriodSelector';
import useComponentUpdate from 'hooks/componentUpdate';
import debounce from 'lodash.debounce';
import Multiselect, { MultiselectProps } from 'components/common/Multiselect';
import { FullPagination } from 'types/table';
import { capitalize, formatDecimalNumber, getNpsTagClassName } from 'utils';
import { getNameWithFamilyNameInitial } from 'utils/name';
import { NextPageContext } from 'next';
import withRoles from 'hooks/withRoles';
import { useUser } from 'contexts/user';
import { COOKIE_NAME_PERIOD, MAIN_ENTITIES } from 'utils/constants';
import { getPeriodFilterOptions } from 'services/filters-service';
import { getCookie } from 'utils/cookie';
import { useModal } from 'hooks/modal';
import FeedbackExportModal from 'components/FeedbackExportModal';
import DownloadIcon from 'assets/icons/download.svg';

const handler = async (ctx: NextPageContext, user: User) => {
  const isManager = user.role === RoleType.manager;
  const periodOptions = await getPeriodFilterOptions({
    default: getCookie(COOKIE_NAME_PERIOD, ctx.req),
    ...(isManager ? { manager: user.id } : {}),
  });
  const defaultPeriod = findSelectedPeriodOption(periodOptions);
  const feedbacks = await getFeedbacks({
    dateFrom: defaultPeriod.range.start,
    dateUntil: defaultPeriod.range.end,
    ...(isManager ? { manager: [user.id] } : {}),
  });

  const managers = !isManager
    ? await getManagers({ allowEndDateSince: defaultPeriod.range.start })
    : [];
  const limitPerPage = 10;

  return {
    props: {
      feedbacks: serializeProps(feedbacks.slice(0, limitPerPage)),
      periodOptions: serializeProps(periodOptions),
      managers: serializeProps(managers),
      pagination: {
        totalCount: feedbacks.length,
        page: 1,
        perPage: limitPerPage,
      },
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

const StartupSelector = withRoles(RoleType.admin)(
  Multiselect as FunctionComponent<MultiselectProps<Startup>>
);
const EmployeeSelector = withRoles(RoleType.admin)(
  Multiselect as FunctionComponent<MultiselectProps<Employee>>
);

export default function Feedbacks({
  feedbacks,
  managers,
  pagination,
  periodOptions,
}: FeedbacksProps) {
  const router = useRouter();
  const { get } = useLazyFetch();
  const page = useRef(pagination.page);
  const [feedbackList, setFeedbackList] = useState([...feedbacks]);
  const [sortBy, setSortBy] = useState(FeedbackSortableField._date);
  const [perPage, setPerPage] = useState(pagination.perPage);
  const [totalCount, setTotalCount] = useState(pagination.totalCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<DateInterval>(
    findSelectedPeriodOption(periodOptions).range
  );
  const [entities, setEntities] = useState<Startup[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<Employee[]>([]);
  const { hasRole } = useUser();
  const selectedManagerIds = useMemo(
    () => selectedManagers.map(manager => manager.id),
    [selectedManagers]
  );

  const { createModal, closeModal } = useModal();
  const displayExportModal = useCallback(
    () =>
      createModal(<FeedbackExportModal periodOptions={periodOptions} closeModal={closeModal} />),
    [periodOptions]
  );

  const tableColumns = useMemo(() => {
    const defineSort = (field: FeedbackSortableField) =>
      setSortBy(sortBy === field ? (`-${field}` as FeedbackSortableField) : field);

    const columns: Column<SerializedFeedback | FullFeedback>[] = [
      {
        label: (
          <SortableCell
            label="Hubvisor"
            ariaLabel="Trier par employé"
            onSort={() => defineSort(FeedbackSortableField.employee)}
          />
        ),
        propertyName: 'employee',
        renderer: data => (
          <div className={styles.avatarCell} data-testid="employee-name-cell">
            <Avatar url={data.employee.pictureURL} size="s" />
            {data.employee.name}
          </div>
        ),
      },
      {
        label: (
          <SortableCell
            label="NPS"
            ariaLabel="Trier par NPS"
            onSort={() => defineSort(FeedbackSortableField.score)}
          />
        ),
        propertyName: 'score',
        renderer: data => (
          <div className={`${styles.npsCell} ${styles[getNpsTagClassName(data.answers.grade)]}`}>
            {formatDecimalNumber(data.answers.grade)}/10
          </div>
        ),
      },
      {
        label: (
          <SortableCell
            label="Compte"
            ariaLabel="Trier par compte"
            onSort={() => defineSort(FeedbackSortableField.account)}
          />
        ),
        propertyName: 'accountName',
        renderer: data => data.client?.account.name ?? '',
      },
      {
        label: (
          <SortableCell
            label="Interlocuteur"
            ariaLabel="Trier par interlocuteur"
            onSort={() => defineSort(FeedbackSortableField.client)}
          />
        ),
        propertyName: 'client',
        renderer: data => data.client?.name ?? '',
      },
      {
        label: (
          <SortableCell
            label="HOT"
            ariaLabel="Trier par manager"
            onSort={() => defineSort(FeedbackSortableField.manager)}
          />
        ),
        propertyName: 'HOT',
        renderer: data => {
          const headOfTeam = managers.find(manager => manager.id === data.employee.managerId);
          return <div className={styles.avatarCell}>{headOfTeam?.name ?? ''}</div>;
        },
      },
      {
        label: (
          <SortableCell
            label="Date du feedback"
            ariaLabel="Trier par date"
            onSort={() => defineSort(FeedbackSortableField.date)}
          />
        ),
        propertyName: 'date',
        renderer: data => new Date(data.date).toLocaleDateString('fr'),
      },
    ];

    if (hasRole(RoleType.manager)) {
      return columns.filter(column => column.propertyName !== 'HOT');
    }

    return columns;
  }, [hasRole, managers, sortBy]);

  const handlePageChange = (p: number) => {
    page.current = p;
    updateTable();
  };
  const handlePerPageChange = (p: number) => {
    page.current = 1;
    setPerPage(p);
  };

  const updateTable = useCallback(() => {
    const params: FeedbackSearchQuery = {
      q: searchQuery,
      page: page.current,
      perPage: perPage,
      start: toStandardDateFormat(new Date(periodFilter.start)),
      end: toStandardDateFormat(new Date(periodFilter.end)),
      startup: entities,
      manager: selectedManagerIds,
      sort: sortBy,
    };

    const queryString = toUrlQuery(params);

    get(`/api/feedbacks?${queryString}`)
      .then(res => res.json())
      .then((res: PaginatedFeedbacks) => {
        setFeedbackList(res.feedbacks as SerializedFeedback[]);
        setTotalCount(res.totalCount || res.feedbacks.length);
      })
      .catch(err => console.error(err));
  }, [get, perPage, sortBy, periodFilter, searchQuery, entities, selectedManagerIds]);

  // Trigger table update on states that do not affect table item count
  useComponentUpdate(() => updateTable(), [perPage, sortBy]);

  // Trigger table update on filters state change
  useComponentUpdate(() => handlePageChange(1), [periodFilter, entities, selectedManagers]);

  // Handle search filter separately for debounce purpose
  const search = debounce(() => handlePageChange(1), 200);
  useComponentUpdate(() => {
    search();
    return () => search.cancel();
  }, [searchQuery]);

  return (
    <>
      <Head>
        <title>Tanuki - Feedbacks</title>
      </Head>
      <main className={styles.feedbacksPage}>
        <div className={styles.head}>
          <h1>Feedbacks</h1>
          <div className={styles.actions}>
            <PeriodSelector
              onChangePeriod={(interval: DateInterval) => setPeriodFilter(interval)}
              options={periodOptions}
              className={styles.periodSelector}
            />
            <Button onClick={() => router.push('/feedbacks/new')}>Nouveau feedback</Button>
          </div>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <div className={styles.searchContainer}>
              <TextInput
                height={50}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                onChange={event => setSearchQuery(event.target.value)}
                label="Rechercher un Hubvisor"
                type="search"
                fullWidth={true}
                autoComplete="off"
              />
            </div>
            <StartupSelector
              label="Sélectionner une entité"
              options={MAIN_ENTITIES}
              defaultValues={entities}
              getOptionLabel={option => capitalize(option)}
              handleChange={setEntities}
              id="entity"
            />
            <EmployeeSelector
              searchLabel="Rechercher un HOT"
              label="Sélectionner un HOT"
              options={managers}
              defaultValues={selectedManagers}
              getOptionLabel={option => getNameWithFamilyNameInitial(option.name)}
              handleChange={values => {
                setSelectedManagers(values);
              }}
              id="HOT"
              getOptionNode={(option, optionLabel) => (
                <div className={styles.managerSearchOption}>
                  <Avatar url={option.pictureURL} size="xs" />
                  {optionLabel}
                </div>
              )}
            />
          </div>
          <Button stylePreset="outlined" onClick={displayExportModal}>
            <DownloadIcon /> Exporter
          </Button>
        </div>
        <div className={styles.feedbacksTableContainer}>
          <Table
            uniqueKeyPrefix="client-table"
            data={feedbackList}
            columns={tableColumns}
            stickyHeader={true}
            className={styles.feedbacksTable}
            url={feedback => `/feedbacks/${feedback.id}`}
          />
          {!!feedbackList.length && (
            <div className={styles.paginationWrapper}>
              <Paginator
                page={page.current}
                perPage={perPage}
                onChangePage={handlePageChange}
                onChangePerPage={handlePerPageChange}
                perPageOptions={[10, 25, 50]}
                elementCount={totalCount}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export interface FeedbacksProps {
  feedbacks: SerializedFeedback[];
  managers: Employee[];
  pagination: FullPagination;
  periodOptions: PeriodOption[];
}
