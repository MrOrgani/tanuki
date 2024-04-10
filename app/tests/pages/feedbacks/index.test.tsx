/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen, waitFor, waitForElementToBeRemoved, act } from '@testing-library/react';
import { startMsw } from 'tests/test-utils';
import { feedbacksWithMissingData, manyFeedbacks } from 'mockData/feedbacks';
import { managerUser, adminUser } from 'mockData/users';
import userEvent from '@testing-library/user-event';
import { handlers } from 'mocks/handlers';
import singletonRouter from 'next/router';
import { manager, manyManagers } from 'mockData/employees';
import { getNameWithFamilyNameInitial } from 'utils/name';
import { SerializedFeedback } from 'types/feedback';
import { serializeProps } from 'utils/serialize';
import { PeriodOption } from 'types/date';

startMsw(handlers);

jest.mock('next/dist/client/router', () => require('next-router-mock'));

const feedbackService = jest.requireActual('services/feedbacks-service');
const employeesService = jest.requireActual('services/employees-service.ts');

const mockFeedbackService = {
  ...feedbackService,
  getFeedbacks: jest.fn(),
  getOldestFeedback: jest.fn(),
};

const mockEmployeesService = {
  ...employeesService,
  getEmployees: jest.fn(),
  getManagers: jest.fn(),
};

jest.mock('services/feedbacks-service', () => mockFeedbackService);
jest.mock('services/employees-service', () => mockEmployeesService);

describe('The FeedbacksList getServerSideProps', () => {
  const { getServerSideProps } = require('pages/feedbacks');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct props to the component', async () => {
    mockFeedbackService.getFeedbacks.mockResolvedValue(manyFeedbacks);
    mockEmployeesService.getManagers.mockResolvedValue(manyManagers);
    mockFeedbackService.getOldestFeedback.mockResolvedValue(null);

    const response = await getServerSideProps({
      req: { headers: { mockCookie: JSON.stringify(adminUser) } },
      res: { locals: { user: adminUser } },
    });

    expect(response.props.feedbacks).toStrictEqual(serializeProps(manyFeedbacks));
    expect(response.props.managers).toEqual(serializeProps(manyManagers));
  });
});

describe('The FeedbackList component', () => {
  const user = userEvent.setup();
  const FeedbackList = require('pages/feedbacks')
    .default as typeof import('pages/feedbacks').default;
  const UserProvider = require('contexts/user').default as typeof import('contexts/user').default;
  const periodOptions: PeriodOption[] = [
    { label: `S1`, key: 's1', range: { start: new Date(), end: new Date() } },
  ];
  const pagination = { totalCount: 1, page: 1, perPage: 10 };
  const avatarComponent = 'Mocked Avatar Component';

  const FeedbackListComponent = (
    <UserProvider user={adminUser}>
      <FeedbackList
        feedbacks={manyFeedbacks as SerializedFeedback[]}
        managers={manyManagers}
        periodOptions={periodOptions}
        pagination={pagination}
      />
    </UserProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "Feedbacks" as page heading', () => {
    render(FeedbackListComponent);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Feedbacks');
  });

  it('should display a period filter', () => {
    render(FeedbackListComponent);

    expect(screen.getByLabelText('Période')).toBeInTheDocument();
  });

  it('should filter feedbacks on a specific employee using the search bar', async () => {
    render(FeedbackListComponent);

    expect(screen.getByText(manyFeedbacks[0].employee.name)).toBeInTheDocument();
    expect(screen.getByText(manyFeedbacks[1].employee.name)).toBeInTheDocument();

    // This component uses a ForwardRef, so we need to "act" wrap this, in order to suppress the warning
    await act(() =>
      user.type(
        screen.getByLabelText('Rechercher un Hubvisor'),
        manyFeedbacks[0].employee.name.split(' ')[0]
      )
    );

    await waitForElementToBeRemoved(() => screen.queryByText(manyFeedbacks[1].employee.name));
    expect(screen.getByText(manyFeedbacks[0].employee.name)).toBeInTheDocument();
  });

  it('should display a Hubvisor search field', async () => {
    render(FeedbackListComponent);
    expect(screen.getByLabelText('Rechercher un Hubvisor')).toBeInTheDocument();
  });

  it("should navigate to the details page when clicking an employee's line", async () => {
    singletonRouter.push('/feedbacks');

    render(FeedbackListComponent);

    await act(() => user.click(screen.getByText(manyFeedbacks[0].employee.name)));

    expect(singletonRouter).toMatchObject({
      asPath: `/feedbacks/${manyFeedbacks[0].id}`,
    });
  });

  it('should sort feedbacks when selecting the employee column header, and reverse the order when selecting it for the second time', async () => {
    render(FeedbackListComponent);

    await act(() => user.click(screen.getByLabelText('Trier par employé')));

    const feedbackElements = await screen.findAllByTestId('employee-name-cell');

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
    });

    await act(() => user.click(screen.getByLabelText('Trier par employé')));

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    });
  });

  it('should sort feedbacks when selecting the account column header, and reverse the order when selecting it for the second time', async () => {
    render(FeedbackListComponent);

    await act(() => user.click(screen.getByLabelText('Trier par compte')));

    const feedbackElements = await screen.findAllByTestId('employee-name-cell');

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
    });

    await act(() => user.click(screen.getByLabelText('Trier par compte')));

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    });
  });

  it('should sort feedbacks when selecting the client column header, and reverse the order when selecting it for the second time', async () => {
    render(FeedbackListComponent);

    await act(() => user.click(screen.getByLabelText('Trier par interlocuteur')));

    const feedbackElements = await screen.findAllByTestId('employee-name-cell');

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
    });

    await act(() => user.click(screen.getByLabelText('Trier par interlocuteur')));

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    });
  });

  it('should sort feedbacks by date by default, and reverse the order when selecting the date header', async () => {
    render(FeedbackListComponent);

    const feedbackElements = await screen.findAllByTestId('employee-name-cell');

    expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));

    await act(() => user.click(screen.getByLabelText('Trier par date')));

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    });
  });

  it('should sort feedbacks from best to worst when selecting the NPS column header, and from worst to best when selecting it for the second time', async () => {
    render(FeedbackListComponent);

    await act(() => user.click(screen.getByLabelText('Trier par NPS')));

    const feedbackElements = await screen.findAllByTestId('employee-name-cell');

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
    });

    await act(() => user.click(screen.getByLabelText('Trier par NPS')));

    await waitFor(() => {
      expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
    });
  });

  describe('when the user is an admin', () => {
    it('should display the following columns: "HOT", "Hubvisor", "Compte", "Client", "Date du feedback", "NPS"', () => {
      render(FeedbackListComponent);

      expect(screen.getByText('HOT')).toBeInTheDocument();
      expect(screen.getByText('Hubvisor')).toBeInTheDocument();
      expect(screen.getByText('Compte')).toBeInTheDocument();
      expect(screen.getByText('Interlocuteur')).toBeInTheDocument();
      expect(screen.getByText('Date du feedback')).toBeInTheDocument();
      expect(screen.getByText('NPS')).toBeInTheDocument();
    });

    it('should display all feedbacks with manager name and avatar, employee name and avatar, account name, client name, date and score', () => {
      render(FeedbackListComponent);

      expect(screen.getAllByText('Mocked Avatar Component')).toHaveLength(manyFeedbacks.length);
      expect(screen.getAllByText(manager.name)).toBeDefined();
      expect(screen.getAllByText(manyFeedbacks[0].client!.account.name)).toBeDefined();
      expect(screen.getAllByText(manyFeedbacks[0].client!.name)).toBeDefined();
      expect(screen.getAllByText(manyFeedbacks[0].employee.name)).toBeDefined();
      expect(screen.getAllByText(manyFeedbacks[0].date.toLocaleDateString('fr'))).toBeDefined();
      expect(screen.getAllByText(`${manyFeedbacks[0].answers.grade}/10`)).toBeDefined();
    });

    it('should display all feedbacks with manager name and avatar, employee name and avatar, date and score', () => {
      render(
        <UserProvider user={adminUser}>
          <FeedbackList
            feedbacks={feedbacksWithMissingData as SerializedFeedback[]}
            managers={manyManagers}
            periodOptions={periodOptions}
            pagination={pagination}
          />
        </UserProvider>
      );

      expect(screen.getAllByText(manager.name)).toHaveLength(2);
      expect(screen.getByText(feedbacksWithMissingData[0].employee.name)).toBeInTheDocument();
      expect(
        screen.getByText(feedbacksWithMissingData[0].date.toLocaleDateString('fr'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${feedbacksWithMissingData[0].answers.grade}/10`)
      ).toBeInTheDocument();

      expect(screen.getByText(feedbacksWithMissingData[1].employee.name)).toBeInTheDocument();
      expect(
        screen.getByText(feedbacksWithMissingData[1].date.toLocaleDateString('fr'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${feedbacksWithMissingData[0].answers.grade}/10`)
      ).toBeInTheDocument();

      expect(screen.getAllByText('Mocked Avatar Component')).toHaveLength(
        feedbacksWithMissingData.length
      );
    });

    it('should sort feedbacks by HOT in alphabetical order when selecting the HOT column header, then by reverse alphabetical order when selecting it for the second time', async () => {
      render(FeedbackListComponent);

      await act(() => user.click(screen.getByLabelText('Trier par manager')));

      const feedbackElements = await screen.findAllByTestId('employee-name-cell');

      await waitFor(() => {
        expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
        expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
      });

      await act(() => user.click(screen.getByLabelText('Trier par manager')));

      await waitFor(() => {
        expect(feedbackElements[0]).toHaveTextContent(new RegExp(manyFeedbacks[1].employee.name));
        expect(feedbackElements[1]).toHaveTextContent(new RegExp(manyFeedbacks[0].employee.name));
      });
    });

    it('should display a startup selector, unfolding it displays all startup options unchecked by default and a select all option', async () => {
      render(FeedbackListComponent);

      await act(() => user.click(screen.getByLabelText('Sélectionner une entité')));

      expect(screen.getByRole('checkbox', { name: /atom/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /epic/i })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: /source/i })).not.toBeChecked();

      expect(screen.getByText(/Tout sélectionner/)).toBeInTheDocument();
    });

    it('should only display feedbacks from epic if user checks epic', async () => {
      render(FeedbackListComponent);

      await act(() => user.click(screen.getByLabelText('Sélectionner une entité')));
      await act(() => user.click(screen.getByRole('checkbox', { name: /epic/i })));

      await waitForElementToBeRemoved(() => screen.queryByText(manyFeedbacks[1].employee.name));
      expect(await screen.findByText(manyFeedbacks[0].employee.name)).toBeInTheDocument();
    });

    it('should display a manager selector, unfolding it displays all managers unchecked by default', async () => {
      render(FeedbackListComponent);

      await act(() => user.click(screen.getByLabelText('Sélectionner un HOT')));

      const avatarComponent = 'Mocked Avatar Component';

      expect(
        screen.getByRole('checkbox', {
          name: `${avatarComponent} ${getNameWithFamilyNameInitial(manyManagers[0].name)}`,
        })
      ).not.toBeChecked();

      expect(
        screen.getByRole('checkbox', {
          name: `${avatarComponent} ${getNameWithFamilyNameInitial(manyManagers[1].name)}`,
        })
      ).not.toBeChecked();
    });

    it('should only display feedbacks from selected manager', async () => {
      render(FeedbackListComponent);

      await act(() => user.click(screen.getByLabelText('Sélectionner un HOT')));

      await act(() =>
        user.click(
          screen.getByRole('checkbox', {
            name: `${avatarComponent} ${getNameWithFamilyNameInitial(manyManagers[0].name)}`,
          })
        )
      );

      await waitFor(() =>
        expect(screen.queryByText(manyFeedbacks[1].employee.name)).not.toBeInTheDocument()
      );

      expect(screen.getByText(manyFeedbacks[0].employee.name)).toBeInTheDocument();
    });
  });

  describe('when the user is a manager', () => {
    const FeedbackListComponent = (
      <UserProvider user={managerUser}>
        <FeedbackList
          feedbacks={[]}
          managers={[]}
          periodOptions={periodOptions}
          pagination={pagination}
        />
      </UserProvider>
    );

    it('should not display the "HOT" column', () => {
      render(FeedbackListComponent);
      expect(screen.queryByText('HOT')).not.toBeInTheDocument();
    });

    it('should not display a startup selector', async () => {
      render(FeedbackListComponent);

      expect(screen.queryByText('Sélectionner une entité')).not.toBeInTheDocument();
    });

    it('should not display a manager selector', async () => {
      render(FeedbackListComponent);

      expect(screen.queryByText('Sélectionner un HOT')).not.toBeInTheDocument();
    });
  });
});
