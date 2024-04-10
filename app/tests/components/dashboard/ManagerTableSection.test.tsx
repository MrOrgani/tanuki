import { render, screen } from '@testing-library/react';
import { managersAggregation } from 'mockData/managersAggregation';
import { DateInterval } from 'types/date';
import ManagerTableSection from 'components/dashboard/ManagerTableSection';

describe('Table section of the dashboard', () => {
  const period: DateInterval = {
    start: new Date('2021-09-13T00:00:00.000Z'),
    end: new Date('2021-09-19T23:59:59.999Z'),
  };

  const ManagerTableSectionComponent = (
    <ManagerTableSection
      periodOptions={[]}
      initialData={managersAggregation[0].managees}
      period={period}
    />
  );

  it('should display 4 header columns', () => {
    render(ManagerTableSectionComponent);

    expect(screen.getByText('Hubvisor')).toBeInTheDocument();
    expect(screen.getByText('NPS Moyen')).toBeInTheDocument();
    expect(screen.getByText('Nombre de feedbacks')).toBeInTheDocument();
    expect(screen.getByText('Date du dernier entretien')).toBeInTheDocument();
  });

  it('should display sortable columns', () => {
    render(ManagerTableSectionComponent);
    expect(screen.getByLabelText('Trier par hubvisor')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par NPS Moyen')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par nombre de feedbacks')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par date du dernier entretien')).toBeInTheDocument();
  });

  it('should display no data message when there is no data', () => {
    render(<ManagerTableSection periodOptions={[]} initialData={[]} period={period} />);
    expect(screen.getByText("Il n'y a pas encore de membre dans votre team.")).toBeInTheDocument();
  });

  it("should display each manager's team member", () => {
    render(ManagerTableSectionComponent);

    managersAggregation[0].managees.forEach(managee => {
      expect(screen.getByText(managee.name)).toBeInTheDocument();
    });
  });
});
