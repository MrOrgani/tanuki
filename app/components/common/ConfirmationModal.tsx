import { createContext, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import styles from 'styles/components/common/ConfirmationModal.module.scss';
import Button from 'components/common/Button';
import { useRouter } from 'next/router';

interface ConfirmationModalProps {
  title: string;
  content: ReactNode;
  className?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

interface ConfirmationModalProviderProps {
  children: ReactNode;
}

export const ConfirmationModalContext = createContext<{
  createModal: (props: ConfirmationModalProps) => void;
  closeModal: () => void;
}>({ createModal: () => {}, closeModal: () => {} });

export function ConfirmationModal({
  title,
  content,
  className,
  confirmLabel = 'Oui',
  onConfirm,
  cancelLabel = 'Non',
  onCancel,
}: ConfirmationModalProps): JSX.Element {
  const confirmButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.currentTarget.textContent === confirmLabel) {
        cancelButton?.current?.focus();
      }
      if (event.currentTarget.textContent === cancelLabel) {
        confirmButton?.current?.focus();
      }
    }
    event.key === 'Escape' && onCancel && onCancel();
  };

  useEffect(() => {
    //prevents modal from instant-closing when toggled with Enter key
    const timer = setTimeout(() => confirmButton.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, [confirmButton]);

  return (
    <main>
      <div className={styles.overlay}>
        <div
          role="dialog"
          className={`${styles.modal} ${className || ''}`}
          aria-labelledby="modal-title">
          <h1 id="modal-title">{title}</h1>
          <div className={styles.contentContainer}>
            <div>{content}</div>
          </div>
          <div className={styles.cta}>
            <Button
              ref={cancelButton}
              onClick={onCancel}
              stylePreset="outlined"
              onKeyDown={handleKeyPress}>
              {cancelLabel}
            </Button>
            <Button ref={confirmButton} onClick={onConfirm} onKeyDown={handleKeyPress}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ConfirmationModalProvider({
  children,
}: ConfirmationModalProviderProps): JSX.Element {
  const [modalProps, setModalProps] = useState<ConfirmationModalProps | null>(null);
  const router = useRouter();
  function createModal(modalProps: ConfirmationModalProps): void {
    setModalProps({
      ...modalProps,
      ...(!modalProps.onCancel ? { onCancel: closeModal } : {}),
    });
  }
  function closeModal(): void {
    setModalProps(null);
  }

  useEffect(() => {
    const handleRouteChange = () => modalProps && setModalProps(null);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, modalProps]);

  return (
    <ConfirmationModalContext.Provider value={{ createModal, closeModal }}>
      {modalProps && (
        <ConfirmationModal
          title={modalProps.title}
          content={modalProps.content}
          className={modalProps.className}
          confirmLabel={modalProps.confirmLabel}
          cancelLabel={modalProps.cancelLabel}
          onConfirm={modalProps.onConfirm}
          onCancel={modalProps.onCancel}></ConfirmationModal>
      )}
      <div aria-hidden={!!modalProps}>{children}</div>
    </ConfirmationModalContext.Provider>
  );
}
