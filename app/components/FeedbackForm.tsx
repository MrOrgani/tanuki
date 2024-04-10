/* eslint-disable react-hooks/exhaustive-deps */
import Head from 'next/head';
import { Employee, RoleType } from '@prisma/client';
import styles from 'styles/components/FeedbackForm.module.scss';
import { AccountWithACMA } from 'types/account';
import { useConfirmationModal, useModal } from 'hooks/modal';
import BackArrow from 'components/common/BackArrow';
import { useRouter } from 'next/router';
import { useState, FormEvent, useCallback, useEffect, useMemo } from 'react';
import Button from 'components/common/Button';
import Combobox from 'components/Combobox';
import { useAlert } from 'components/common/Alert/AlertProvider';
import TextInput from 'components/common/TextInput';
import { FullFeedback } from 'types/feedback';
import { Client, ClientWithAccount } from 'types/client';
import Slider from '@mui/material/Slider';
import { toStandardDateFormat } from 'utils/date';
import useFeedbackForm from 'hooks/feedbackForm';
import { FeedbackFormActionType } from 'reducers/feedbackReducer';
import ClientFormModal from 'components/modals/ClientFormModal';
import { isConsultant } from 'utils';
import { useUser } from 'contexts/user';
import useNavigationObserver from 'hooks/navigation-observer';

const today = toStandardDateFormat(new Date());
const minDate = toStandardDateFormat(new Date(Date.UTC(2022, 1, 1)));

export default function FeedbackForm({
  employees,
  accounts,
  ACMAs,
  clients,
  feedback,
}: FeedbackFormProps) {
  const router = useRouter();
  const { createModal: createCancelModal, closeModal: closeCancelModal } = useConfirmationModal();
  const { createModal: createClientModal, closeModal: closeClientModal } = useModal();
  const { form, isValidForm, isValidDate, onFieldChange, submit, dispatch } =
    useFeedbackForm(feedback);
  const { createAlert } = useAlert();
  const [newClient, setNewClient] = useState<Client | null>(null);
  const { hasRole, user } = useUser();

  const { resumeNavigation } = useNavigationObserver({
    shouldPauseNavigation: true,
    onNavigationAttempt: (nextUrl: string) => {
      closeCancelModal();
      closeClientModal();
      createCancelModal({
        title: 'Abandon',
        content:
          'Êtes-vous sûr.e de vouloir quitter cette page ? Les modifications que vous avez apportées ne seront pas enregistrées. ',
        confirmLabel: 'Quitter',
        cancelLabel: 'Annuler',
        onConfirm: () => {
          resumeNavigation();
          closeCancelModal();
          router.push(nextUrl);
        },
      });
    },
  });

  const hubvisorWarning = useMemo(() => {
    if (!form.employee) return null;

    if (hasRole(RoleType.admin) && !isConsultant(form.employee)) {
      return 'Attention cet Hubvisor n’est pas un consultant.';
    } else if (hasRole(RoleType.manager) && form.employee.managerId !== user.id) {
      return 'Cet Hubvisor ne fait pas partie de vos mentorés, une fois créé vous n’aurez plus de visibilité sur ce Feedback.';
    }

    return null;
  }, [form.employee]);

  const onCancel = () => {
    createCancelModal({
      title: 'Abandon',
      content: feedback
        ? 'Êtes-vous sûr.e de vouloir abandonner la modification de ce feedback ?'
        : "Êtes-vous sûr.e de vouloir abandonner la création d'un nouveau feedback ?",
      confirmLabel: 'Oui',
      cancelLabel: 'Non',
      onConfirm: () => {
        resumeNavigation();
        closeCancelModal();
        router.back();
      },
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await submit();
      resumeNavigation();
      if (feedback) {
        createAlert('info', 'Le feedback a été modifié avec succès');
        router.push(`/feedbacks/${feedback.id}`);
      } else {
        createAlert(
          'info',
          `Votre feedback sur ${form.employee?.name} a été enregistré avec succès`
        );
        router.push('/feedbacks');
      }
    } catch (e) {
      createAlert('error', (e as Error).message);
      return;
    }
  };

  const displayCreateClientModal = useCallback(() => {
    createClientModal(
      <ClientFormModal
        accounts={accounts}
        ACMAs={ACMAs}
        clients={clients}
        closeModal={closeClientModal}
        onValidation={(data: Client) => {
          setNewClient(data);
          closeClientModal();
        }}
      />
    );
  }, []);

  useEffect(() => {
    if (!newClient) return;

    clients.push(newClient);
    dispatch({
      type: FeedbackFormActionType.UPDATE_FIELD,
      key: 'client',
      payload: newClient,
    });
  }, [newClient]);

  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      e.returnValue =
        'Êtes-vous sûr.e de vouloir quitter cette page ? Les données saisies seront perdues.';
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Tanuki - {feedback ? 'Editer un feedback' : 'Nouveau feedback'}</title>
      </Head>
      <main className={styles.feedbackForm}>
        <div className={styles.headWrapper}>
          <BackArrow onSelect={() => router.back()} />
          <h1>{feedback ? 'Editer un feedback' : 'Nouveau feedback'}</h1>
        </div>
        <p className={styles.infoMandatory}>Champs obligatoires</p>
        <form onSubmit={onSubmit}>
          <fieldset>
            <legend>
              <h2>Consultant</h2>
              <h3>Sélectionnez le consultant en charge de la mission</h3>
            </legend>
            <div className={styles.formRow}>
              <label htmlFor="employee" className={styles.mandatory}>
                Collaborateur
              </label>
              <div className={styles.formField}>
                <Combobox<Employee>
                  defaultValue={form.employee || undefined}
                  id="employee"
                  disableClearable
                  options={employees}
                  getOptionLabel={option => option.name || ''}
                  keyToCompare="id"
                  onChange={(employee, _, reason) =>
                    reason === 'select' &&
                    dispatch({
                      type: FeedbackFormActionType.UPDATE_FIELD,
                      key: 'employee',
                      payload: employee,
                    })
                  }
                />
                {hubvisorWarning && <span className={styles.error}>{hubvisorWarning}</span>}
              </div>
            </div>
            <div className={styles.formRow}>
              <label htmlFor="date" className={styles.mandatory}>
                Date de la prise du feedback
              </label>
              <div className={styles.formField}>
                <TextInput
                  id="date"
                  type="date"
                  variant="outlined"
                  defaultValue={form.date}
                  name="date"
                  onChange={onFieldChange}
                  inputProps={{ max: today, min: minDate }}
                  error={!isValidDate}
                  required
                  fullWidth
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className={styles.headerClient}>
              <div>
                <h2>Client interviewé</h2>
                <h3>Sélectionnez un client existant ou créez un nouveau client</h3>
              </div>
              <Button type="button" stylePreset="link" onClick={displayCreateClientModal}>
                Ajouter un client
              </Button>
            </legend>
            <div className={styles.formRow}>
              <label htmlFor="client" className={styles.mandatory}>
                Nom
              </label>
              <div className={styles.formField}>
                <Combobox<ClientWithAccount>
                  defaultValue={form.client || undefined}
                  watchValue={newClient}
                  id="client"
                  disableClearable
                  options={clients}
                  getOptionLabel={option => `${option?.name} - ${option?.account.name}` || ''}
                  keyToCompare="id"
                  onChange={(client, _, reason) =>
                    reason === 'select' &&
                    dispatch({
                      type: FeedbackFormActionType.UPDATE_FIELD,
                      key: 'client',
                      payload: client,
                    })
                  }
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Feedback</h2>
              <h3>
                Remplissez le questionnaire ci-dessous à l’aide des indications afin que chaque
                consultant reçoive un retour équitable
              </h3>
            </legend>
            <div className={styles.formRow}>
              <div className={styles.fieldHead}>
                <label htmlFor="context" className={styles.mandatory}>
                  Comment se passe la mission ?
                </label>
                <p>
                  Volonté de prendre de la hauteur en évaluant les 6 derniers mois et non pas
                  uniquement les faits récents sur mission.
                </p>
              </div>
              <div className={styles.formField}>
                <TextInput
                  id="context"
                  multiline
                  fullWidth
                  placeholder={'Saisir votre commentaire ici...'}
                  variant="outlined"
                  minRows={3}
                  name="context"
                  onChange={onFieldChange}
                  required
                  defaultValue={feedback?.answers?.context || ''}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.fieldHead}>
                <label htmlFor="positives" className={styles.mandatory}>
                  Quels sont les points forts de l’Hubvisor ?
                </label>
                <p>
                  Volonté de prendre de la hauteur en évaluant les 6 derniers mois et non pas
                  uniquement les faits récents sur mission.
                </p>
              </div>
              <div className={styles.formField}>
                <TextInput
                  id="positives"
                  multiline
                  fullWidth
                  placeholder={'Saisir votre commentaire ici...'}
                  variant="outlined"
                  minRows={3}
                  name="positives"
                  onChange={onFieldChange}
                  required
                  defaultValue={feedback?.answers?.positives || ''}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.fieldHead}>
                <label htmlFor="improvements" className={styles.mandatory}>
                  Quels sont les axes d'amélioration de l’Hubvisor sur la mission ?
                </label>
                <p>
                  Bien creuser ce sujet car le consultant pourrait ne pas être d'accord. Il faut
                  donc un maximum d'infos et de faits.
                </p>
              </div>
              <div className={styles.formField}>
                <TextInput
                  id="improvements"
                  multiline
                  fullWidth
                  placeholder={'Saisir votre commentaire ici...'}
                  variant="outlined"
                  minRows={3}
                  name="improvements"
                  onChange={onFieldChange}
                  required
                  defaultValue={feedback?.answers?.areasOfImprovement || ''}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.fieldHead}>
                <label htmlFor="objectives" className={styles.mandatory}>
                  Quelles sont les objectifs sur la mission pour les 6 prochains mois ?
                </label>
                <p>Exemple : Les chantiers à venir, la roadmap à 6 mois, les grands jalons, etc.</p>
              </div>
              <div className={styles.formField}>
                <TextInput
                  id="objectives"
                  multiline
                  fullWidth
                  placeholder={'Saisir votre commentaire ici...'}
                  variant="outlined"
                  minRows={3}
                  name="objectives"
                  onChange={onFieldChange}
                  required
                  defaultValue={feedback?.answers?.objectives || ''}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <label htmlFor="details">Commentaires additionnels</label>
              <div className={styles.formField}>
                <TextInput
                  id="details"
                  multiline
                  fullWidth
                  placeholder={'Saisir votre commentaire ici...'}
                  variant="outlined"
                  minRows={3}
                  name="details"
                  onChange={onFieldChange}
                  defaultValue={feedback?.answers?.details || ''}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.fieldHead}>
                <label htmlFor="grade" className={styles.mandatory}>
                  A combien évaluerais-tu ton niveau de satisfaction sur 10 concernant la prestation
                  de l'Hubvisor ?
                </label>
                <p>
                  10 étant le consultant rêvé et irréprochable et 1 étant le pire consultant avec
                  lequel tu collabores.
                </p>
              </div>
              <div className={styles.gradeField}>
                <Slider
                  id="grade"
                  classes={{
                    rail: styles.rail,
                    track: styles.track,
                    markLabel: styles.markLabel,
                  }}
                  value={form.grade || 1}
                  aria-label="Note de satisfaction"
                  step={0.5}
                  min={1}
                  max={10}
                  marks={[
                    1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
                  ].map(i => ({
                    label: i % 1 === 0 ? i : null,
                    value: i,
                  }))}
                  valueLabelDisplay="on"
                  onChange={(_, newValue) =>
                    dispatch({
                      type: FeedbackFormActionType.UPDATE_FIELD,
                      key: 'grade',
                      payload: typeof newValue === 'number' ? newValue : 1,
                    })
                  }
                />
              </div>
            </div>
          </fieldset>
          <div className={styles.cta}>
            <Button type="button" onClick={onCancel} stylePreset="outlined">
              Annuler
            </Button>
            <Button disabled={form.isLoading || !isValidForm} type="submit">
              {feedback ? 'Enregistrer les modifications' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

export interface FeedbackFormProps {
  employees: Employee[];
  accounts: AccountWithACMA[];
  ACMAs: Employee[];
  clients: Client[];
  feedback?: FullFeedback;
}
