import styles from 'styles/components/dashboard/ManagerTableSection.module.scss';
import { useState } from 'react';
import { toDisplayDateFormat, toStandardDateFormat } from 'utils/date';
import useLazyFetch from 'hooks/lazy-fetch';
import { toUrlQuery } from 'utils/urlQuery';
import useComponentUpdate from 'hooks/componentUpdate';
import {
  ManageeFeedbacksAggregation,
  ManagersAggregationSearchQuery,
  ManagersAggregationSort,
  PaginatedManagersAggregation,
} from 'types/employee';
import { DateInterval, PeriodOption } from 'types/date';
import Table, { Column } from 'components/common/Table';
import Avatar from 'components/common/Avatar';
import { formatDecimalNumber, getNpsTagClassName, slugifyEmployee } from 'utils';
import SortableCell from 'components/common/SortableCell';
import TableSectionHead from './TableSectionHead';

const ManagerTableSection = ({ initialData, period, periodOptions }: ManagerTableSectionProps) => {
  const [managees, setManagees] = useState<ManageeFeedbacksAggregation[]>(initialData);
  const [sortBy, setSortBy] = useState<ManagersAggregationSort>(ManagersAggregationSort.NameAsc);
  const { get } = useLazyFetch();

  const tableColumns: Column<ManageeFeedbacksAggregation>[] = [
    {
      label: (
        <SortableCell
          label="Hubvisor"
          ariaLabel="Trier par hubvisor"
          onSort={() => defineSort(ManagersAggregationSort.NameAsc)}
        />
      ),
      propertyName: 'employeeName',
      renderer: data => (
        <div className={styles.avatarCell}>
          <Avatar url={data.pictureURL} size="xs" />
          <span>{data.name}</span>
        </div>
      ),
    },
    {
      label: (
        <SortableCell
          label="NPS Moyen"
          ariaLabel="Trier par NPS Moyen"
          onSort={() => defineSort(ManagersAggregationSort.AverageAsc)}
        />
      ),
      propertyName: 'average',
      renderer: data => (
        <>
          {data.average ? (
            <span className={`${styles.npsCell} ${styles[getNpsTagClassName(data.average)]}`}>
              {formatDecimalNumber(data.average)}/10
            </span>
          ) : (
            <span className={`${styles.npsCell} ${styles.neutral}`}>Indisponible</span>
          )}
        </>
      ),
    },
    {
      label: (
        <SortableCell
          label="Nombre de feedbacks"
          ariaLabel="Trier par nombre de feedbacks"
          onSort={() => defineSort(ManagersAggregationSort.CountAsc)}
        />
      ),
      propertyName: 'count',
      renderer: data => <span>{data.count}</span>,
    },
    {
      label: (
        <SortableCell
          label="Date du dernier entretien"
          ariaLabel="Trier par date du dernier entretien"
          onSort={() => defineSort(ManagersAggregationSort.DateAsc)}
        />
      ),
      propertyName: 'date',
      renderer: data => <span>{data.date ? toDisplayDateFormat(new Date(data.date)) : '-'}</span>,
    },
  ];

  const defineSort = (column: ManagersAggregationSort) =>
    setSortBy(sortBy => (sortBy === column ? (`-${column}` as ManagersAggregationSort) : column));

  const updateTable = () => {
    const params: ManagersAggregationSearchQuery = {
      sort: sortBy,
      start: toStandardDateFormat(new Date(period.start)),
      end: toStandardDateFormat(new Date(period.end)),
    };

    const queryString = toUrlQuery(params);

    get(`api/employees/managers/aggregation?${queryString}`)
      .then(res => res.json())
      .then((res: PaginatedManagersAggregation) => {
        if (!res.totalCount) {
          throw new Error('Aucun résultat');
        }
        setManagees(res.results[0].managees);
      })
      .catch(() => {
        setManagees(initialData);
      });
  };

  useComponentUpdate(updateTable, [period, sortBy]);

  return (
    <section className={styles.tableSection}>
      <div className={styles.head}>
        <TableSectionHead periodOptions={periodOptions} />
      </div>
      <div className={styles.tableContainer}>
        <Table
          uniqueKeyPrefix="managees-table"
          data={managees}
          columns={tableColumns}
          stickyHeader={false}
          className={styles.table}
          url={employee => `/profile/${slugifyEmployee(employee.id)}`}
          emptyPlaceholder="Il n'y a pas encore de membre dans votre team."
        />
      </div>
    </section>
  );
};

export default ManagerTableSection;

interface ManagerTableSectionProps {
  initialData: ManageeFeedbacksAggregation[];
  period: DateInterval;
  periodOptions: PeriodOption[];
}
