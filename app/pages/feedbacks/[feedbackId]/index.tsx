import BackArrow from 'components/common/BackArrow';
import { useRouter } from 'next/router';
import { FullFeedback } from 'types/feedback';
import { getFullLetterMonthDateString, toDisplayDateFormat } from 'utils/date';
import styles from 'styles/pages/feedbacks/[feedbackId].module.scss';
import Head from 'next/head';
import { getEmployeeFeedbackIndex, getFeedbackById } from 'services/feedbacks-service';
import { NextPageContext } from 'next';
import Button from 'components/common/Button';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { getNameWithFamilyNameInitial } from 'utils/name';
import withRoleGuardServerSideProps from 'middlewares/withRoleGuardServerSideProps';
import { RoleType, User } from '@prisma/client';
import ApplicationError from 'errors/ApplicationError';
import { serializeProps } from 'utils/serialize';
import HubCard from 'components/feedback/HubCard';
import ClientCard from 'components/feedback/ClientCard';
import { ErrorCode } from 'types/errors';
import { useConfirmationModal } from 'hooks/modal';
import InfoIcon from 'assets/icons/info.svg';
import useLazyFetch from 'hooks/lazy-fetch';
import { useAlert } from 'components/common/Alert/AlertProvider';
import { formatDecimalNumber, getNpsTagClassName } from 'utils';

const handler = async (ctx: NextPageContext, user: User) => {
  const feedbackId = ctx.query.feedbackId?.toString();
  const feedback = feedbackId ? await getFeedbackById(feedbackId) : null;

  if (!feedback) {
    throw new ApplicationError(ErrorCode.NOT_FOUND, 'Feedback not found', 'FeedbackDetail');
  }

  if (user.role === RoleType.manager && feedback.employee.managerId !== user.id) {
    throw new ApplicationError(
      ErrorCode.FORBIDDEN,
      "You don't have access to this feedback",
      'FeedbackDetail'
    );
  }

  const feedbackIndex = await getEmployeeFeedbackIndex(feedback.id, feedback.employee.id);

  return {
    props: {
      feedback: serializeProps(feedback),
      feedbackIndex: feedbackIndex,
    },
  };
};

export const getServerSideProps = withRoleGuardServerSideProps(handler);

function FeedbackDetails({ feedback, feedbackIndex }: FeedbackDetailsProps) {
  const router = useRouter();
  const formattedDate = getFullLetterMonthDateString(new Date(feedback.date).toDateString());
  const { createModal, closeModal } = useConfirmationModal();
  const employeeNameWithFamilyNameInitial = getNameWithFamilyNameInitial(feedback.employee.name);
  const { httpDelete } = useLazyFetch();
  const { createAlert } = useAlert();

  const handleDelete = async () => {
    try {
      const res = await httpDelete(`/api/feedbacks/${feedback.id}`);

      if (res.status !== 204) {
        throw new Error(
          'Une erreur est survenue lors de la suppression du feedback, veuillez réessayer plus tard'
        );
      }
      closeModal();
      createAlert('info', 'La suppression a été réalisée avec succès.');
      router.push('/feedbacks');
    } catch (error) {
      createAlert(
        'error',
        'Une erreur est survenue lors de la suppression du feedback, veuillez réessayer plus tard'
      );
    }
  };

  const openDeleteModal = () => {
    createModal({
      title: 'Supprimer',
      content: getDeleteModalContent(feedbackIndex, new Date(feedback.date)),
      className: styles.deleteModal,
      cancelLabel: 'Non',
      confirmLabel: 'Oui',
      onConfirm: handleDelete,
    });
  };

  return (
    <>
      <Head>
        <title>
          Tanuki - Feedback n°{feedbackIndex} de {employeeNameWithFamilyNameInitial}
        </title>
      </Head>
      <main className={styles.feedbackDetails}>
        <div className={styles.levelHead}>
          <div className={styles.levelHeadLeft}>
            <BackArrow onSelect={() => router.push('/feedbacks')} />
            <h1>
              Feedback n°{feedbackIndex} de {employeeNameWithFamilyNameInitial}
            </h1>
          </div>
          <div className={styles.levelHeadRight}>
            <Button
              type="button"
              stylePreset="outlined"
              onClick={() => router.push(`/feedbacks/${feedback.id}/edit`)}>
              <ModeEditOutlineIcon /> Modifier
            </Button>
            <Button type="button" stylePreset="outlined" variant="danger" onClick={openDeleteModal}>
              <DeleteOutline /> Supprimer
            </Button>
          </div>
        </div>
        <div className={styles.topCards}>
          <HubCard employee={feedback.employee} />
          <ClientCard client={feedback.client} />
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.leftSection}>
              <h2>
                Feedback <span className={styles.date}>({formattedDate})</span>
              </h2>
            </div>
          </div>
          <div className={styles.feedbackBody}>
            <div className={styles.fieldWrapper}>
              <h3>Note de satisfaction</h3>
              <span
                className={`${styles.taggedValue} ${
                  styles[getNpsTagClassName(feedback.answers.grade)]
                }`}>
                {formatDecimalNumber(feedback.answers.grade)}/10
              </span>
            </div>
            <div className={styles.fieldWrapper}>
              <h3>Contexte</h3>
              <p>{feedback.answers.context}</p>
            </div>
            <div className={styles.fieldWrapper}>
              <h3>Points positifs</h3>
              <p>{feedback.answers.positives}</p>
            </div>
            <div className={styles.fieldWrapper}>
              <h3>Axes d'amélioration</h3>
              <p>{feedback.answers.areasOfImprovement}</p>
            </div>
            <div className={styles.fieldWrapper}>
              <h3>Objectifs</h3>
              <p>{feedback.answers.objectives}</p>
            </div>
            {feedback.answers.details && (
              <div className={styles.fieldWrapper}>
                <h3>Autres commentaires</h3>
                <p>{feedback.answers.details}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

const getDeleteModalContent = (number: number, date: Date) => {
  return (
    <>
      <p className={styles.text}>Êtes-vous sûr.e de vouloir supprimer ce feedback ?</p>
      <p className={styles.details}>
        "Feedback n°{number} du {toDisplayDateFormat(date)}"
      </p>
      <p className={styles.warning}>
        <InfoIcon /> Toutes les données seront perdues
      </p>
    </>
  );
};

export interface FeedbackDetailsProps {
  feedback: FullFeedback;
  feedbackIndex: number;
}

export default FeedbackDetails;
