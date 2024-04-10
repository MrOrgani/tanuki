import { useCallback, useMemo } from 'react';
import usePagination from '@mui/material/usePagination';
import styles from 'styles/components/common/Paginator.module.scss';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface PaginatorProps {
  page: number;
  perPage: number;
  perPageOptions: number[];
  elementCount: number;
  onChangePage: (page: number) => void;
  onChangePerPage: (perPage: number) => void;
}

const Paginator = ({
  page,
  perPage,
  perPageOptions,
  elementCount,
  onChangePage,
  onChangePerPage,
}: PaginatorProps) => {
  const pageCount = useMemo(() => Math.ceil(elementCount / perPage), [perPage, elementCount]);

  const { items } = usePagination({
    page: page,
    count: pageCount,
    siblingCount: 2,
    onChange: (_, page) => onChangePage(page),
  });

  const labelTracker = useMemo(
    () =>
      `${(page - 1) * perPage + 1}-${
        page * perPage > elementCount ? elementCount : page * perPage
      } sur ${elementCount}`,
    [page, perPage, elementCount]
  );

  const getPageItem = useCallback(({ page, type, selected, ...props }) => {
    switch (type) {
      case 'start-ellipsis':
      case 'end-ellipsis':
        return '…';
      case 'page':
        return (
          <button
            type="button"
            className={`${styles.pageNumber} ${selected ? styles.selected : ''} `}
            {...props}>
            {page}
          </button>
        );
      default: // type => 'previous' | 'next'
        return (
          <button
            type="button"
            aria-label={type === 'previous' ? 'précédent' : 'suivant'}
            className={`${styles[type]} ${styles.arrow}`}
            {...props}>
            {type === 'previous' ? (
              <ArrowBackIosNewIcon className={styles.arrowIcon} />
            ) : (
              <ArrowForwardIosIcon className={styles.arrowIcon} />
            )}
          </button>
        );
    }
  }, []);

  return (
    <div className={styles.paginator}>
      <div className={styles.tracker}>
        <span>{labelTracker}</span>
      </div>
      <div className={styles.pageSelector}>
        <ul className={styles.pageItems}>
          {items.map((item, index) => (
            <li className={styles.pageItem} key={`page-${index}`}>
              {getPageItem(item)}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.perPage}>
        <label htmlFor="perPage">Nombre de résultats par page</label>
        <Select
          id="perPage"
          value={perPage}
          onChange={e => onChangePerPage(parseInt(e.target.value as string))}
          sx={{
            '& legend': { display: 'none' },
            '& fieldset': { top: 0 },
            height: '40px',
            width: '75px',
          }}>
          {perPageOptions.map(option => (
            <MenuItem key={`per-page-${option}`} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default Paginator;
