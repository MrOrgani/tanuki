import { render, screen } from '@testing-library/react';
import { manyFeedbacks } from 'mockData/feedbacks';
import { consultant, consultant3 } from 'mockData/employees';
import { serializeProps } from 'utils/serialize';
import { adminUser, managerUser } from 'mockData/users';
import { ProfileProps } from 'pages/profile/[slug]';
import { PeriodOption } from 'types/date';

const mockServices = {
  employee: {
    getEmployeeByEmail: jest.fn(),
  },
  feedback: {
    getFeedbacks: jest.fn(),
  },
  filters: {
    getPeriodFilterOptions: jest.fn(),
  },
};

jest.mock('services/feedbacks-service.ts', () => mockServices.feedback);
jest.mock('services/employees-service.ts', () => mockServices.employee);
jest.mock('services/filters-service.ts', () => mockServices.filters);

describe('The Profile getServerSideProps', () => {
  const getServerSideProps = require('pages/profile/[slug]').getServerSideProps;
  const periodOptions: PeriodOption[] = [
    { label: `S1`, key: 's1', range: { start: new Date(), end: new Date() } },
  ];

  it('should render required props properly', async () => {
    mockServices.employee.getEmployeeByEmail.mockResolvedValue(consultant);
    mockServices.feedback.getFeedbacks.mockResolvedValue(manyFeedbacks);
    mockServices.filters.getPeriodFilterOptions.mockResolvedValue(periodOptions);

    const { props } = await getServerSideProps({
      res: { locals: { user: adminUser } },
      query: { slug: 'sourcien' },
    });

    expect(props.employee).toEqual(serializeProps(consultant));
    expect(props.feedbacks).toEqual(serializeProps(manyFeedbacks));
    expect(props.periodOptions).toEqual(serializeProps(periodOptions));
  });

  it('should return 404 error props when the url slug matches no existing employee', async () => {
    mockServices.employee.getEmployeeByEmail.mockResolvedValue(null);

    const { props } = await getServerSideProps({
      res: { locals: { user: adminUser } },
      query: { slug: 'sourcien' },
    });

    expect(props.error).toBeDefined();
    expect(props.error.statusCode).toEqual(404);
  });

  it('should return error 403 props when a manager tries to access a profile that is not part of his team', async () => {
    mockServices.employee.getEmployeeByEmail.mockResolvedValue(consultant3);

    const { props } = await getServerSideProps({
      res: { locals: { user: managerUser } },
      query: { slug: 'sourcien' },
    });

    expect(props.error).toBeDefined();
    expect(props.error.statusCode).toEqual(403);
  });
});

describe('The Profile component', () => {
  const periodOptions: PeriodOption[] = [
    { label: `S1`, key: 's1', range: { start: new Date(), end: new Date() } },
  ];
  const ProfileComponent = require('pages/profile/[slug]/index').default as React.FC<ProfileProps>;
  const DefaultProfileComponent = (
    <ProfileComponent
      feedbacks={manyFeedbacks}
      employee={consultant}
      periodOptions={periodOptions}
    />
  );

  it('should display the main page title', () => {
    render(DefaultProfileComponent);
    expect(
      screen.getByRole('heading', { level: 1, name: `Fiche de ${consultant.name}` })
    ).toBeInTheDocument();
  });

  it('should display an arrow back button', () => {
    render(DefaultProfileComponent);
    expect(screen.getByLabelText(`retourner à la page précédente`)).toBeInTheDocument();
  });

  it('should display a period selector filter', () => {
    render(DefaultProfileComponent);
    expect(screen.getByLabelText('Période')).toBeInTheDocument();
  });

  it('should display the hubvisor card title', () => {
    render(DefaultProfileComponent);
    expect(screen.getByRole('heading', { level: 3, name: 'Hubvisor' })).toBeInTheDocument();
  });

  it('should display the average card title', () => {
    render(DefaultProfileComponent);
    expect(screen.getByRole('heading', { level: 3, name: 'NPS Moyen' })).toBeInTheDocument();
  });

  it('should display hubvisor table title', () => {
    render(DefaultProfileComponent);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tableau des Feedbacks' })
    ).toBeInTheDocument();
  });

  it('should display a "Nouveau feedback" button', () => {
    render(DefaultProfileComponent);
    expect(screen.getByText('Nouveau feedback')).toBeInTheDocument();
  });
});
