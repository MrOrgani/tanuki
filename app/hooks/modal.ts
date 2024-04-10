import { ConfirmationModalContext } from 'components/common/ConfirmationModal';
import { ModalContext } from 'components/common/Modal';
import { useContext } from 'react';

export const useModal = () => useContext(ModalContext);
export const useConfirmationModal = () => useContext(ConfirmationModalContext);
