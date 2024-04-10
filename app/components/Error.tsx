import styles from 'styles/pages/Error.module.scss';
import Button from 'components/common/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ErrorComponentProps {
  code: number;
  details: string;
}

export default function ErrorComponent({ code, details }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className={styles.errorPage}>
      <div className={styles.info}>
        <h1>Erreur {code}</h1>
        <p>{details}</p>
      </div>
      <div className={styles.cta}>
        <Link href="/">
          <a>
            <Button>Dashboard</Button>
          </a>
        </Link>
        <Button onClick={() => router.back()} stylePreset="outlined">
          Page précédente
        </Button>
      </div>
    </div>
  );
}
