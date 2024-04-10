import { act, render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import TableSection from 'components/dashboard/TableSection';
import { managersAggregation } from 'mockData/managersAggregation';
import userEvent from '@testing-library/user-event';
import { PaginatedManagersAggregation } from 'types/employee';
import { Startup } from '@prisma/client';
import { DateInterval } from 'types/date';
import { startMsw } from 'tests/test-utils';
import { handlers } from 'mocks/handlers';
import { rest } from 'msw';
import { ModalProvider } from 'components/common/Modal';
import UserProvider from 'contexts/user';
import { adminUser } from 'mockData/users';

jest.mock('next/dist/client/router', () => require('next-router-mock'));
const server = startMsw(handlers);

describe('Table section of the dashboard', () => {
  const entities = [Startup.atom, Startup.epic, Startup.source];
  const period: DateInterval = {
    start: new Date('2021-09-13T00:00:00.000Z'),
    end: new Date('2021-09-19T23:59:59.999Z'),
  };

  const paginatedManagers: PaginatedManagersAggregation = {
    page: 1,
    perPage: 10,
    totalCount: managersAggregation.length,
    results: managersAggregation,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const TableSectionComponent = (
    <TableSection
      initialData={paginatedManagers}
      period={period}
      entities={entities}
      periodOptions={[]}
    />
  );

  const user = userEvent.setup();

  it('should display the table section title', () => {
    render(TableSectionComponent);
    expect(screen.getByText('Progression dans la prise de feedbacks')).toBeInTheDocument();
  });

  it('should display the button "Nouveau feedback"', () => {
    render(TableSectionComponent);
    expect(screen.getByText('Nouveau feedback')).toBeInTheDocument();
  });

  it('should display the button "Exporter"', () => {
    render(TableSectionComponent);
    expect(screen.getByText('Exporter')).toBeInTheDocument();
  });

  it('should open a modal when clicking on "Exporter" ', async () => {
    render(
      <UserProvider user={adminUser}>
        <ModalProvider>
          <TableSection
            initialData={paginatedManagers}
            period={period}
            entities={entities}
            periodOptions={[]}
          />
        </ModalProvider>
      </UserProvider>
    );

    await user.click(screen.getByText('Exporter'));
    expect(await screen.findByText('Exporter les NPS Moyens')).toBeInTheDocument();
  });

  it('should display a search bar', () => {
    render(TableSectionComponent);
    expect(screen.getByLabelText('Rechercher un HoT')).toBeInTheDocument();
  });

  it('should display 4 header labels for each row', () => {
    const rowCount = paginatedManagers.totalCount;
    render(TableSectionComponent);

    expect(screen.getAllByText('HOT')).toHaveLength(rowCount);
    expect(screen.getAllByText('Date dernier entretien')).toHaveLength(rowCount);
    expect(screen.getAllByText("Nombre de feedbacks de l'équipe")).toHaveLength(rowCount);
    expect(screen.getAllByText("NPS moyen de l'équipe")).toHaveLength(rowCount);
  });

  it('should display all managers as non-expanded rows by default', () => {
    render(TableSectionComponent);
    expect(screen.getAllByLabelText('agrandir')).toHaveLength(paginatedManagers.totalCount);
    managersAggregation.forEach(manager => {
      expect(screen.getByText(manager.name)).toBeInTheDocument();
    });
  });

  it('should expand the first manager row and show all his team members by clicking on the expand icon', async () => {
    render(TableSectionComponent);

    await act(() => user.click(screen.getAllByLabelText('agrandir')[0]));

    for (const managee of paginatedManagers.results[0].managees) {
      expect(await screen.findByText(managee.name)).toBeInTheDocument();
    }
  });

  it('should expand only one item at a time', async () => {
    render(TableSectionComponent);

    await act(() => user.click(screen.getAllByLabelText('agrandir')[0]));
    expect(await screen.findAllByLabelText('réduire')).toHaveLength(1);
    await act(() => user.click(screen.getAllByLabelText('agrandir')[1]));
    expect(await screen.findAllByLabelText('réduire')).toHaveLength(1);
  });

  it('should display a single item when using the search bar', async () => {
    server.use(
      rest.get('/api/employees/managers/aggregation', (req, res, ctx) => {
        return res(ctx.json({ ...paginatedManagers, results: [managersAggregation[0]] }));
      })
    );
    render(TableSectionComponent);

    expect(screen.getByText(managersAggregation[0].name)).toBeInTheDocument();
    expect(screen.getByText(managersAggregation[1].name)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Rechercher un HoT'), 'Billy');
    expect(await screen.findByText(managersAggregation[0].name)).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(managersAggregation[1].name));
  });

  it('should display no data message when there is no data', () => {
    render(
      <TableSection
        initialData={{ ...paginatedManagers, totalCount: 0, results: [] }}
        period={period}
        entities={entities}
        periodOptions={[]}
      />
    );
    expect(screen.getByText('Aucun résultat ne correspond à votre recherche.')).toBeInTheDocument();
  });
});
