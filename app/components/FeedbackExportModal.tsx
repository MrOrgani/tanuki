/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
import { useEffect, useRef, useState } from 'react';
import { toStandardDateFormat } from 'utils/date';
import { useAlert } from 'components/common/Alert/AlertProvider';
import Button from 'components/common/Button';
import styles from 'styles/components/modals/ExportModal.module.scss';
import { ExportData } from 'types/feedback';
import useDownload from 'hooks/download';
import { DateInterval, PeriodOption } from 'types/date';
import PeriodSelector from './common/PeriodSelector';
import { RoleType } from '@prisma/client';
import { withRolesRef } from 'hooks/withRoles';

const ExportPeriodSelector = withRolesRef(RoleType.admin || RoleType.manager)(PeriodSelector);
const generateFilename = (selectedPeriod?: string | null, selectedType?: string | null) => {
  const filename = selectedType
    ? `Feedbacks - ${selectedType} ${selectedPeriod || ''}`
    : `Feedbacks -  ${selectedPeriod || ''}`;

  return `${filename.trim().replaceAll(' ', '_')}.csv`;
};

const FeedbackExportModal = ({ closeModal, periodOptions }: ExportFeedbackModalFormProps) => {
  const { createAlert } = useAlert();
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const exportLink = useRef<HTMLAnchorElement>(null);
  const periodRef = useRef<HTMLSelectElement>(null);
  const [period, setPeriod] = useState<DateInterval | null>(null);
  const isValid = Boolean(period);

  const { getDownloadLink } = useDownload();
  // Download action triggered under the hood
  useEffect(() => {
    if (exportData) {
      exportLink?.current?.click();
      closeModal();
      createAlert('info', "L'export a été réalisé avec succès.");
    }
  }, [exportData]);

  const handleExportFeedbackDownload = async () => {
    if (!isValid || !period) {
      return createAlert('error', 'Veuillez remplir tous les champs.');
    }
    try {
      const data = await getDownloadLink({
        endpoint: '/api/feedbacks/export',
        data: {
          start: toStandardDateFormat(new Date(period.start)),
          end: toStandardDateFormat(new Date(period.end)),
        },
        filename: generateFilename(periodRef.current?.innerText),
      });

      setExportData({
        href: data.url,
        download: data.filename,
      });
    } catch (error) {
      setExportData(null);
      createAlert('error', (error as Error).message);
    }
  };

  return (
    <div className={styles.modal}>
      <h2 id="modal-title">Exporter les feedbacks</h2>
      <p>Exporter les feedbacks sélectionnés au format CSV</p>
      <div className={styles.content}>
        <div className={styles.form}>
          <ExportPeriodSelector
            theme="default"
            ref={periodRef}
            options={periodOptions}
            onChangePeriod={period => setPeriod(period)}
            displayEmpty
            defaultValue={''}
            renderValue={value => {
              if (value === '') {
                return 'Sélectionner une période';
              }
              return periodOptions[parseInt(value as string)].label;
            }}
          />
        </div>
      </div>
      <div className={styles.cta}>
        <Button onClick={closeModal} stylePreset="outlined">
          Annuler
        </Button>
        <Button onClick={handleExportFeedbackDownload} disabled={!isValid}>
          Exporter
        </Button>
      </div>
      <a
        data-testid="feedbacks-downloader"
        aria-hidden="true"
        ref={exportLink}
        {...exportData}
        tabIndex={-1}
      />
    </div>
  );
};

export interface ExportFeedbackModalFormProps {
  closeModal: () => void;
  periodOptions: PeriodOption[];
}

export default FeedbackExportModal;
