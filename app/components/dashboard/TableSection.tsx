import styles from 'styles/components/dashboard/TableSection.module.scss';
import { useRef, useState } from 'react';
import { toStandardDateFormat } from 'utils/date';
import Paginator from 'components/common/Paginator';
import useLazyFetch from 'hooks/lazy-fetch';
import { toUrlQuery } from 'utils/urlQuery';
import useComponentUpdate from 'hooks/componentUpdate';
import {
  ManagerAggregation,
  ManagersAggregationSearchQuery,
  PaginatedManagersAggregation,
} from 'types/employee';
import { DateInterval, PeriodOption } from 'types/date';
import { Startup } from '@prisma/client';
import TextInput from 'components/common/TextInput';
import InputAdornment from '@mui/material/InputAdornment';
import Search from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import ManagerList from './ManagerList';
import TableSectionHead from './TableSectionHead';

const TableSection = ({ initialData, period, entities, periodOptions }: TableSectionProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const page = useRef(initialData.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialData.perPage);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [managers, setManagers] = useState<ManagerAggregation[]>(initialData.results);
  const [searchQuery, setSearchQuery] = useState('');
  const { get } = useLazyFetch();

  const handleItemExpansion = (itemKey: string) => () => {
    setExpandedItem(expandedItem => (expandedItem === itemKey ? null : itemKey));
  };

  const handlePageChange = (n: number) => {
    page.current = n;
    setExpandedItem(null);
    updateList();
  };

  const handlePerPageChange = (n: number) => {
    page.current = 1;
    setItemsPerPage(n);
  };

  const triggerFilters = () => {
    page.current = 1;
    setExpandedItem(null);
    updateList();
  };

  const handleSearch = debounce(triggerFilters, 250);

  const updateList = () => {
    const params: ManagersAggregationSearchQuery = {
      page: page.current,
      perPage: itemsPerPage,
      start: toStandardDateFormat(new Date(period.start)),
      end: toStandardDateFormat(new Date(period.end)),
      startups: entities,
      q: searchQuery.trim(),
    };

    const queryString = toUrlQuery(params);

    get(`api/employees/managers/aggregation?${queryString}`)
      .then(res => res.json())
      .then((res: PaginatedManagersAggregation) => {
        setManagers(res.results);
        setTotalCount(res.totalCount);
      })
      .catch(() => {
        setManagers(initialData.results);
        setTotalCount(initialData.totalCount);
      });
  };

  useComponentUpdate(triggerFilters, [itemsPerPage, period, entities]);

  useComponentUpdate(() => {
    handleSearch();
    return () => handleSearch.cancel();
  }, [searchQuery]);

  return (
    <section className={styles.tableSection}>
      <div className={styles.head}>
        <TableSectionHead periodOptions={periodOptions} />
      </div>
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
          label="Rechercher un HoT"
          type="search"
          fullWidth={true}
          autoComplete="off"
        />
      </div>
      <div className={styles.listContainer}>
        <ManagerList
          managers={managers}
          expandedItem={expandedItem}
          handleItemExpansion={handleItemExpansion}
        />
        {!!managers.length && (
          <div className={styles.paginationWrapper}>
            <Paginator
              page={page.current}
              perPage={itemsPerPage}
              onChangePage={handlePageChange}
              onChangePerPage={handlePerPageChange}
              perPageOptions={[10, 25, 50]}
              elementCount={totalCount}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default TableSection;

interface TableSectionProps {
  initialData: PaginatedManagersAggregation;
  period: DateInterval;
  entities: Startup[];
  periodOptions: PeriodOption[];
}
