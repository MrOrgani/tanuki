/* eslint-disable react-hooks/exhaustive-deps */
import Button from 'components/common/Button';
import EmployeesExportModal from 'components/modals/EmployeesExportModal';
import { useModal } from 'hooks/modal';
import { PeriodOption } from 'types/date';
import DownloadIcon from 'assets/icons/download.svg';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const TableSectionHead = ({ periodOptions }: TableSectionHeadProps) => {
  const { createModal, closeModal } = useModal();
  const router = useRouter();

  const displayExportModal = useCallback(
    () =>
      createModal(<EmployeesExportModal periodOptions={periodOptions} closeModal={closeModal} />),
    [periodOptions]
  );
  return (
    <>
      <h2>Progression dans la prise de feedbacks</h2>
      <div>
        <Button stylePreset="outlined" onClick={displayExportModal}>
          <DownloadIcon /> Exporter
        </Button>
        <Button onClick={() => router.push('/feedbacks/new')} type="button" stylePreset="contained">
          Nouveau feedback
        </Button>
      </div>
    </>
  );
};

interface TableSectionHeadProps {
  periodOptions: PeriodOption[];
}

export default TableSectionHead;
