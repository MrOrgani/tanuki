import Link from 'next/link';
import styles from 'styles/Navigation/NavigationElement.module.scss';
import Icon from '@mdi/react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

interface NavigationElementProps {
  link: string;
  icon: string;
  text: string;
}

export default function NavigationElement({
  link,
  icon,
  text,
}: NavigationElementProps): JSX.Element {
  const router = useRouter();
  const active = useMemo<boolean>(
    () => router.pathname === link || router.pathname.match(new RegExp(`^${link}/`, 'i')) !== null,
    [router.pathname, link]
  );

  return (
    <li className={`${styles.navElement} ${active ? styles.current : ''}`}>
      <Link href={link}>
        <a aria-current={active && 'page'}>
          <Icon path={icon} />
          <span>{text}</span>
        </a>
      </Link>
    </li>
  );
}
