import { mdiAccountTie, mdiHome, mdiForum } from '@mdi/js';
import UserCard from 'components/UserCard';
import Link from 'next/link';
import styles from 'styles/Navigation/NavigationMenu.module.scss';
import NavigationElement from './NavigationElement';
import Logo from 'assets/images/logo.svg';

export default function NavigationMenu() {
  return (
    <aside className={styles.navigationMenu}>
      <Link href="/">
        <a className={styles.logo}>
          <span className={styles.icon}>
            <Logo />
          </span>
          <span className={styles.title}>Tanuki</span>
        </a>
      </Link>
      <nav aria-label="barre de navigation">
        <ul>
          <NavigationElement icon={mdiHome} text="Dashboard" link="/" />
          <NavigationElement icon={mdiForum} text="Feedbacks" link="/feedbacks" />
          <NavigationElement icon={mdiAccountTie} text="Clients" link="/clients" />
        </ul>
      </nav>
      <footer>
        <UserCard />
      </footer>
    </aside>
  );
}
