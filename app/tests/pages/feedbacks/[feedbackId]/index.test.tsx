/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import singletonRouter from 'next/router';
import { singleFeedback } from 'mockData/feedbacks';
import { adminUser } from 'mockData/users';
import { AlertProvider } from 'components/common/Alert/AlertProvider';
import { startMsw } from 'tests/test-utils';
import { handlers } from 'mocks/handlers';
import { getNameWithFamilyNameInitial } from 'utils/name';
import { FC } from 'react';
import { FeedbackDetailsProps } from 'pages/feedbacks/[feedbackId]';
import { ConfirmationModalProvider } from 'components/common/ConfirmationModal';

jest.mock('next/dist/client/router', () => require('next-router-mock'));
startMsw(handlers);

const mockGetFeedbackById = jest.fn();
const mockGetEmployeeFeedbackIndex = jest.fn();

jest.mock('services/feedbacks-service.ts', () => ({
  getFeedbackById: mockGetFeedbackById,
  getEmployeeFeedbackIndex: mockGetEmployeeFeedbackIndex,
}));

describe('The Feedback Details getServerSideProps', () => {
  const getServerSideProps = require('pages/feedbacks/[feedbackId]/index').getServerSideProps;

  beforeAll(() => singletonRouter.push('/feedbacks/90'));

  mockGetFeedbackById.mockResolvedValue(singleFeedback);
  mockGetEmployeeFeedbackIndex.mockResolvedValue(150);

  it('should return a single feedback answer', async () => {
    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
      query: { feedbackId: '90' },
    });

    expect(response.props.feedback).toStrictEqual(JSON.parse(JSON.stringify(singleFeedback)));
  });

  it('should return the employee feedback number', async () => {
    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
      query: { feedbackId: '90' },
    });

    expect(response.props.feedbackIndex).toEqual(150);
  });
});

describe('The Feedback Details component', () => {
  const FeedbackDetails = require('pages/feedbacks/[feedbackId]/index')
    .default as FC<FeedbackDetailsProps>;
  const FeedbackDetailsComponent = <FeedbackDetails feedbackIndex={1} feedback={singleFeedback} />;
  const user = userEvent.setup();

  it('should display the feedback details with the appropriate month', () => {
    render(FeedbackDetailsComponent);

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('(10 novembre 2022)')).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.client!.name)).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.client!.account.name)).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.answers.positives!)).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.answers.areasOfImprovement!)).toBeInTheDocument();
  });

  it("should still display the available details with the appropriate month when the client doesn't exist", () => {
    render(<FeedbackDetails feedback={{ ...singleFeedback, client: null }} feedbackIndex={1} />);

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('(10 novembre 2022)')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.answers.positives!)).toBeInTheDocument();
    expect(screen.getByText(singleFeedback.answers.areasOfImprovement!)).toBeInTheDocument();
  });

  it('should display a main heading with the feedback index and employee name', () => {
    render(<FeedbackDetails feedback={singleFeedback} feedbackIndex={150} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      `Feedback n°150 de ${getNameWithFamilyNameInitial(singleFeedback.employee.name)}`
    );
  });

  it('should redirect users to the feedbacks list upon clicking the back arrow', async () => {
    singletonRouter.push('/feedbacks/90');

    render(FeedbackDetailsComponent);

    await user.click(screen.getByLabelText('retourner à la page précédente'));

    expect(singletonRouter).toMatchObject({
      pathname: '/feedbacks',
    });
  });

  it('should display button Modifier feedback', async () => {
    singletonRouter.push('/feedbacks/90');

    render(FeedbackDetailsComponent);
    expect(screen.getByText('Modifier')).toBeInTheDocument();
  });

  it('should redirect to feedback edit page when clicking on Modifier', async () => {
    render(
      <AlertProvider>
        <FeedbackDetails feedback={{ ...singleFeedback }} feedbackIndex={1} />
      </AlertProvider>
    );
    await user.click(screen.getByText('Modifier'));
    expect(singletonRouter).toMatchObject({ asPath: `/feedbacks/${singleFeedback.id}/edit` });
  });

  describe('delete action', () => {
    const FeedbackDetailsComponent = (
      <ConfirmationModalProvider>
        <FeedbackDetails feedbackIndex={1} feedback={singleFeedback} />
      </ConfirmationModalProvider>
    );

    it('should display a "Supprimer" button', () => {
      render(FeedbackDetailsComponent);
      expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    });

    it('should display a confirmation modal when clicking the "Supprimer" button', async () => {
      render(FeedbackDetailsComponent);
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Supprimer' })
      ).toBeInTheDocument();
    });

    it('should redirect to the feedback list after deleting a feedback', async () => {
      render(FeedbackDetailsComponent);
      await user.click(screen.getByRole('button', { name: 'Supprimer' }));
      await user.click(await screen.findByRole('button', { name: 'Oui' }));
      await waitFor(() => {
        expect(singletonRouter).toMatchObject({ asPath: '/feedbacks' });
      });
    });
  });
});
