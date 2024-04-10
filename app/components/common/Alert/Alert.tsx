import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import { ReactChild } from 'react';

import styles from 'styles/components/common/Alert.module.scss';

export interface AlertProps {
  children: ReactChild;
  type?: string;
}
const ALERT_ICONS: Record<string, string> = {
  info: mdiInformation,
  error: mdiAlertCircleOutline,
  done: mdiCheckCircleOutline,
};

export default function Alert({ children, type = 'info' }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[type]}`} role="alert">
      <Icon path={ALERT_ICONS[type]} className={styles.icon} data-testid="alert-icon" />
      <p>{children}</p>
      <span>{''}</span>
    </div>
  );
}
