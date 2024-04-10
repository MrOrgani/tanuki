/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
import { useEffect, useRef, useState } from 'react';
import { useAlert } from 'components/common/Alert/AlertProvider';
import Button from 'components/common/Button';
import styles from 'styles/components/modals/ExportModal.module.scss';
import { ExportData } from 'types/feedback';
import useDownload from 'hooks/download';
import { EmployeesExportType } from 'types/employee';
import PeriodSelector from 'components/common/PeriodSelector';
import { DateInterval, PeriodOption } from 'types/date';
import { toStandardDateFormat } from 'utils/date';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { withRolesRef } from 'hooks/withRoles';
import { RoleType } from '@prisma/client';
import { useUser } from 'contexts/user';

const ExportTypeSelector = withRolesRef(RoleType.admin)(Select);

const generateFilename = (selectedPeriod?: string | null, selectedType?: string | null) => {
  const filename = selectedType
    ? `NPS Moyen ${selectedType} ${selectedPeriod || ''}`
    : `NPS Moyen ${selectedPeriod || ''}`;

  return `${filename.trim().replaceAll(' ', '_')}.csv`;
};

const EmployeesExportModal = ({ closeModal, periodOptions }: EmployeesExportModalProps) => {
  const { hasRole } = useUser();
  const { createAlert } = useAlert();
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const exportLink = useRef<HTMLAnchorElement>(null);
  const { getDownloadLink } = useDownload();
  const [period, setPeriod] = useState<DateInterval | null>(null);
  const [exportType, setExportType] = useState<EmployeesExportType | ''>('');
  const periodRef = useRef<HTMLSelectElement>(null);
  const exportTypeRef = useRef<HTMLSelectElement>(null);

  const isValid = Boolean((hasRole(RoleType.manager) || exportType) && period);

  useEffect(() => {
    if (exportData) {
      exportLink?.current?.click();
      closeModal();
      createAlert('info', "L'export a été réalisé avec succès.");
    }
  }, [exportData]);

  const handleDownload = async () => {
    if (!isValid || !period) {
      return createAlert('error', 'Veuillez remplir tous les champs.');
    }
    try {
      const data = await getDownloadLink({
        endpoint: '/api/employees/export',
        data: {
          start: toStandardDateFormat(new Date(period.start)),
          end: toStandardDateFormat(new Date(period.end)),
          ...(exportType ? { type: exportType } : {}),
        },
        filename: generateFilename(periodRef.current?.innerText, exportTypeRef.current?.innerText),
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
      <h2 id="modal-title">Exporter les NPS Moyens</h2>
      <p>Exporter les NPS sélectionnés au format CSV</p>
      <div className={styles.content}>
        <div className={styles.form}>
          <PeriodSelector
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

          <ExportTypeSelector
            aria-label="Type d'export"
            ref={exportTypeRef}
            onChange={e => setExportType(e.target.value as EmployeesExportType)}
            fullWidth={true}
            value={exportType}
            displayEmpty
            renderValue={value => {
              switch (value) {
                case EmployeesExportType.Consultants:
                  return 'Mentorés';
                case EmployeesExportType.Managers:
                  return 'Head of Team';
                default:
                  return 'Sélectionner un type de consultant';
              }
            }}
            sx={{
              '& legend': { display: 'none' },
              '& fieldset': { top: 0, borderColor: '#E6E8EA' },
              '& svg': { color: '#666565' },
              color: '#666565',
            }}>
            <MenuItem value={EmployeesExportType.Consultants}>Mentorés</MenuItem>
            <MenuItem value={EmployeesExportType.Managers}>Head of Team</MenuItem>
          </ExportTypeSelector>
        </div>
      </div>
      <div className={styles.cta}>
        <Button onClick={closeModal} stylePreset="outlined">
          Annuler
        </Button>
        <Button onClick={handleDownload} disabled={!isValid}>
          Exporter
        </Button>
      </div>
      <a
        data-testid="employees-export-downloader"
        aria-hidden="true"
        ref={exportLink}
        {...exportData}
        tabIndex={-1}
      />
    </div>
  );
};

export interface EmployeesExportModalProps {
  closeModal: () => void;
  periodOptions: PeriodOption[];
}

export default EmployeesExportModal;
