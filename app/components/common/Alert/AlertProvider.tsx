import { createContext, ReactChild, ReactNode, useContext, useEffect, useState } from 'react';

import Alert from 'components/common/Alert/Alert';

interface AlertContent {
  type: string;
  children: ReactChild;
  timer: number;
}

const AlertContext = createContext<{
  createAlert: (type: string, children: ReactChild, timer?: number) => void;
}>({
  createAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

export function AlertProvider({ children }: AlertProvider) {
  const [alert, setAlert] = useState<AlertContent | null>(null);
  function createAlert(type: string, children: ReactChild, timer = 3000) {
    setAlert({ type, children, timer });
  }

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), alert.timer);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <AlertContext.Provider value={{ createAlert }}>
      {alert && <Alert type={alert.type}>{alert.children}</Alert>}
      {children}
    </AlertContext.Provider>
  );
}

interface AlertProvider {
  children: ReactNode;
}
