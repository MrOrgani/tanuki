import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import MuiTable from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import styles from 'styles/components/common/Table.module.scss';
import InfoIcon from 'assets/icons/info.svg';
import { useRouter } from 'next/router';
import { KeyboardEvent } from 'react';
import Link from 'next/link';

export interface Column<T> {
  label: string | JSX.Element;
  propertyName: string;
  renderer: (data: T) => JSX.Element | string;
}

interface Props<TData> {
  data: TData[];
  uniqueKeyPrefix: string;
  columns: Column<TData>[];
  stickyHeader: boolean;
  className?: string;
  url?: (data: TData) => string;
  emptyPlaceholder?: string;
}

export default function Table<TData>({
  data,
  uniqueKeyPrefix: uniqueKey,
  columns,
  stickyHeader = false,
  className,
  url,
  emptyPlaceholder,
}: Props<TData>) {
  const router = useRouter();
  const handleLinks = (data: TData, openInNewTab: boolean) => () => {
    if (url) {
      if (openInNewTab) {
        window.open(url(data), '_blank');
      } else {
        router.push(url(data));
      }
    }
  };

  const handleKeyDown = (data: TData) => (event: KeyboardEvent) => {
    const { key, metaKey } = event;

    if (key === 'Enter') {
      if (!metaKey) {
        handleLinks(data, false)();
      } else {
        event.preventDefault();
        handleLinks(data, true)();
      }
    }
  };

  return (
    <TableContainer
      component={Paper}
      className={`${styles.tableContainer} ${className || styles.defaultTable}`}>
      <MuiTable stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={`${column.propertyName}_${index}_header`}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length ? (
            data.map((datum, indexRow) => (
              <TableRow
                key={`${uniqueKey}_${indexRow}`}
                tabIndex={0}
                onKeyDown={handleKeyDown(datum)}
                className={url ? styles.clickableRow : ''}>
                {columns.map(({ propertyName, renderer }, indexCol) => (
                  <TableCell key={`${uniqueKey}_${propertyName}_${indexRow}_${indexCol}`}>
                    <Link href={url ? url(datum) : ''} passHref>
                      <a className={styles.linkCell} tabIndex={-1}>
                        {renderer(datum)}
                      </a>
                    </Link>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className={styles.emptyContent}>
                  <div>
                    <InfoIcon />
                    <span>{emptyPlaceholder || "Il n'y a aucun résultat."}</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
