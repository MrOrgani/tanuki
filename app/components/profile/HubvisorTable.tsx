import styles from 'styles/components/profile/HubvisorTable.module.scss';
import SortableCell from 'components/common/SortableCell';
import Table, { Column } from 'components/common/Table';
import { useMemo } from 'react';
import { FeedbackSortableField, FullFeedback } from 'types/feedback';
import Avatar from 'components/common/Avatar';
import { formatDecimalNumber, getNpsTagClassName } from 'utils';

const HubvisorTable = ({ feedbacks, onSort }: HubvisorTableProps) => {
  const tableColumns = useMemo(() => {
    const columns: Column<FullFeedback>[] = [
      {
        label: <SortableCell label="Hubvisor" ariaLabel="Trier par employé" onSort={() => {}} />,
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
            onSort={() => onSort(FeedbackSortableField.score)}
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
            onSort={() => onSort(FeedbackSortableField.account)}
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
            onSort={() => onSort(FeedbackSortableField.client)}
          />
        ),
        propertyName: 'client',
        renderer: data => data.client?.name ?? '',
      },
      {
        label: (
          <SortableCell
            label="Date"
            ariaLabel="Trier par date"
            onSort={() => onSort(FeedbackSortableField.date)}
          />
        ),
        propertyName: 'date',
        renderer: data => new Date(data.date).toLocaleDateString('fr'),
      },
    ];

    return columns;
  }, [onSort]);

  return (
    <Table<FullFeedback>
      uniqueKeyPrefix="hubvisor-table"
      data={feedbacks}
      columns={tableColumns}
      stickyHeader={false}
      className={styles.hubvisorTable}
      url={feedback => `/feedbacks/${feedback.id}`}
    />
  );
};

export interface HubvisorTableProps {
  feedbacks: FullFeedback[];
  onSort: (sortBy: FeedbackSortableField) => void;
}

export default HubvisorTable;
