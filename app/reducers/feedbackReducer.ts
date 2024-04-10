import { Employee } from '@prisma/client';
import { ClientWithAccount } from 'types/client';

export interface FeedbackFormState {
  isLoading: boolean;
  error: string | null;
  positives: string;
  improvements: string;
  context: string;
  objectives: string;
  details: string;
  grade: number;
  employee: Employee | null;
  client: ClientWithAccount | null;
  date: string;
}

export interface FeedbackFormAction {
  type: FeedbackFormActionType;
  payload?: FeedbackFormState[keyof FeedbackFormState];
  key?: keyof FeedbackFormState;
}

export enum FeedbackFormActionType {
  'UPDATE_FIELD',
  'LOADING',
  'COMPLETE',
}

export const feedbackReducer = (state: FeedbackFormState, action: FeedbackFormAction) => {
  switch (action.type) {
    case FeedbackFormActionType.UPDATE_FIELD:
      if (!action.key) return state;
      return { ...state, [action.key]: action.payload };
    case FeedbackFormActionType.LOADING:
      return { ...state, isLoading: true };
    case FeedbackFormActionType.COMPLETE:
      return { ...state, isLoading: false };
    default:
      return state;
  }
};
