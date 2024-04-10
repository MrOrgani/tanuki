import { ChangeEvent, useReducer } from 'react';
import { FullFeedback } from 'types/feedback';
import { toStandardDateFormat } from 'utils/date';
import useLazyFetch from './lazy-fetch';
import {
  FeedbackFormActionType,
  FeedbackFormState,
  feedbackReducer,
} from 'reducers/feedbackReducer';

const today = toStandardDateFormat(new Date());
const minDate = toStandardDateFormat(new Date(Date.UTC(2022, 1, 1)));

const getInitialState = (feedback?: FullFeedback): FeedbackFormState => ({
  isLoading: false,
  error: null,
  positives: feedback?.answers.positives || '',
  improvements: feedback?.answers.areasOfImprovement || '',
  context: feedback?.answers.context || '',
  objectives: feedback?.answers.objectives || '',
  details: feedback?.answers.details || '',
  grade: feedback?.answers.grade || 1,
  employee: feedback?.employee || null,
  client: feedback?.client || null,
  date: feedback ? toStandardDateFormat(new Date(feedback.date)) : today,
});

const useFeedbackForm = (feedback?: FullFeedback) => {
  const [form, dispatch] = useReducer(feedbackReducer, getInitialState(feedback));
  const { post, put } = useLazyFetch();

  const isValidDate = form.date && form.date >= minDate && form.date <= today;

  const isValidForm = Boolean(
    form.client &&
      form.grade &&
      form.employee &&
      form.positives.trim() &&
      form.improvements.trim() &&
      form.context.trim() &&
      form.objectives.trim() &&
      isValidDate
  );

  const onFieldChange = (e: ChangeEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    dispatch({
      type: FeedbackFormActionType.UPDATE_FIELD,
      key: name as keyof FeedbackFormState,
      payload: value,
    });
  };

  const submit = async () => {
    if (!isValidForm) {
      throw new Error(
        `Veuillez vérifier que tous les champs obligatoires sont remplis et valides.`
      );
    }

    dispatch({ type: FeedbackFormActionType.LOADING });
    const feedbackData = {
      employeeId: form.employee?.id,
      clientId: form.client?.id,
      date: form.date,
      answers: {
        areasOfImprovement: form.improvements,
        grade: form.grade,
        positives: form.positives,
        context: form.context,
        objectives: form.objectives,
        details: form.details,
      },
    };

    if (feedback) {
      const res = await put('/api/feedbacks', { id: feedback.id, ...feedbackData });
      if (res.status !== 204) {
        throw new Error(
          `Une erreur est survenue lors de la mise à jour du feedback : ${await res.text()}`
        );
      }
    } else {
      const res = await post('/api/feedbacks', feedbackData);
      if (res.status !== 201) {
        throw new Error(`Nous n'avons pas réussi à enregistrer le feedback : ${await res.text()}`);
      }
    }

    dispatch({ type: FeedbackFormActionType.COMPLETE });
    return true;
  };

  return {
    form,
    isValidForm,
    isValidDate,
    onFieldChange,
    submit,
    dispatch,
  };
};

export default useFeedbackForm;
