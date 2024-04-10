import { render, screen } from '@testing-library/react';
import Dashboard from 'pages/index';
import { manyFeedbacks } from 'mockData/feedbacks';
import { PeriodOption } from 'types/date';
import UserProvider from 'contexts/user';
import { adminUser, managerUser } from 'mockData/users';
import { managersAggregation } from 'mockData/managersAggregation';

describe('Dashboard page', () => {
  const periodOptions: PeriodOption[] = [
    {
      label: 'Semaine dernière',
      key: 's1',
      range: {
        start: new Date('2021-09-13T00:00:00.000Z'),
        end: new Date('2021-09-19T23:59:59.999Z'),
      },
    },
  ];

  const paginatedManagers = {
    page: 1,
    perPage: 10,
    results: [],
    totalCount: 0,
  };

  const DashboardComponent = (
    <Dashboard
      feedbacks={manyFeedbacks}
      periodOptions={periodOptions}
      paginatedManagers={paginatedManagers}
      managees={[]}
    />
  );

  it('should display "Bienvenue sur Tanuki" on the homepage', () => {
    render(DashboardComponent);
    expect(screen.getByText('Bienvenue sur Tanuki,')).toBeInTheDocument();
  });

  it('should display a period filter with a default value', () => {
    render(DashboardComponent);
    expect(screen.getByLabelText('Période')).toBeInTheDocument();
    expect(screen.getByText(periodOptions[0].label)).toBeVisible();
  });

  describe('admin context', () => {
    const AdminDashboardComponent = (
      <UserProvider user={adminUser}>{DashboardComponent}</UserProvider>
    );

    it('should display an entity filter without any selected value', () => {
      render(AdminDashboardComponent);
      expect(screen.getByLabelText('Sélectionner une entité')).toBeInTheDocument();
      expect(screen.queryByText('Atom')).not.toBeInTheDocument();
      expect(screen.queryByText('Epic')).not.toBeInTheDocument();
      expect(screen.queryByText('Source')).not.toBeInTheDocument();
    });

    it('should display a search bar in the table section', () => {
      render(AdminDashboardComponent);
      expect(screen.getByLabelText('Rechercher un HoT')).toBeInTheDocument();
    });

    it('should display a list of managers with a dropdown action for each row', () => {
      render(
        <UserProvider user={adminUser}>
          <Dashboard
            feedbacks={[]}
            periodOptions={periodOptions}
            paginatedManagers={{
              page: 1,
              perPage: 10,
              totalCount: managersAggregation.length,
              results: managersAggregation,
            }}
            managees={[]}
          />
        </UserProvider>
      );
      expect(screen.getAllByLabelText('agrandir')).toHaveLength(managersAggregation.length);
    });
  });

  describe('manager context', () => {
    const ManagerDashboardComponent = (
      <UserProvider user={managerUser}>{DashboardComponent}</UserProvider>
    );

    it('should not display entity filter', () => {
      render(ManagerDashboardComponent);
      expect(screen.queryByText('Sélectionner une entité')).not.toBeInTheDocument();
    });

    it('should not display search bar', () => {
      render(ManagerDashboardComponent);
      expect(screen.queryByText('Rechercher un HoT')).not.toBeInTheDocument();
    });

    it('should display a table with 4 header columns', () => {
      render(ManagerDashboardComponent);

      expect(screen.getByText('Hubvisor')).toBeInTheDocument();
      expect(screen.getByText('NPS Moyen')).toBeInTheDocument();
      expect(screen.getByText('Nombre de feedbacks')).toBeInTheDocument();
      expect(screen.getByText('Date du dernier entretien')).toBeInTheDocument();
    });
  });
});
