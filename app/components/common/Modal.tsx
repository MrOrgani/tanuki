import { useRouter } from 'next/router';
import { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import styles from 'styles/components/common/Modal.module.scss';

interface ModalProps {
  children: React.ReactNode;
}

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalContext = createContext<{
  createModal: (content: ReactNode) => void;
  closeModal: () => void;
}>({ createModal: () => {}, closeModal: () => {} });

export function Modal({ children }: ModalProps): JSX.Element {
  return (
    <main>
      <div className={styles.overlay}>
        <div role="dialog" className={styles.modal} aria-labelledby="modal-title">
          {children}
        </div>
      </div>
    </main>
  );
}

export function ModalProvider({ children }: ModalProviderProps): JSX.Element {
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const KEY_NAME_ESC = 'Escape';
  const KEY_EVENT_TYPE = 'keyup';
  const router = useRouter();

  function createModal(content: ReactNode): void {
    setModalContent(content);
  }

  function closeModal(): void {
    setModalContent(null);
  }

  const handleEscKey = useCallback(event => {
    if (event.key === KEY_NAME_ESC) {
      setModalContent(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener(KEY_EVENT_TYPE, handleEscKey, false);

    return () => {
      document.removeEventListener(KEY_EVENT_TYPE, handleEscKey, false);
    };
  }, [handleEscKey]);

  useEffect(() => {
    const handleRouteChange = () => modalContent && setModalContent(null);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, modalContent]);

  return (
    <ModalContext.Provider value={{ createModal, closeModal }}>
      {modalContent && <Modal>{modalContent}</Modal>}
      <div aria-hidden={!!modalContent}>{children}</div>
    </ModalContext.Provider>
  );
}
