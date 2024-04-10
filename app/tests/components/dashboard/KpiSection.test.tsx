import { Startup } from '@prisma/client';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KpiSection from 'components/dashboard/KpiSection';
import { manyFeedbacks } from 'mockData/feedbacks';
import { DateInterval } from 'types/date';
import singletonRouter from 'next/router';

jest.mock('next/dist/client/router', () => require('next-router-mock'));

describe('KPI section of the dashboard', () => {
  const entities = [Startup.atom, Startup.epic, Startup.source];
  const period: DateInterval = {
    start: new Date('2021-09-13T00:00:00.000Z'),
    end: new Date('2021-09-19T23:59:59.999Z'),
  };

  const KpiSectionComponent = (
    <KpiSection initialData={manyFeedbacks} period={period} entities={entities} />
  );

  const user = userEvent.setup();

  it('should display the KPI section title and its 3 KPI', () => {
    render(KpiSectionComponent);
    expect(screen.getByText('Données sur la période en cours')).toBeInTheDocument();
    expect(screen.getByText('Feedbacks')).toBeInTheDocument();
    expect(screen.getByText('NPS moyen')).toBeInTheDocument();
    expect(screen.getByText('NPS insuffisant')).toBeInTheDocument();
  });

  it('should display a placeholder text on numbered KPI cards when there is no feedback', () => {
    render(<KpiSection initialData={[]} period={period} entities={entities} />);
    expect(screen.getAllByText("Il n'y a pas encore de feedback.")).toHaveLength(2);
  });

  describe('KPI > Feedback count', () => {
    it('should display the total number of feedbacks in tanuki', () => {
      render(KpiSectionComponent);
      expect(screen.getByTestId('kpi-count')).toHaveTextContent(`${manyFeedbacks.length}`);
    });
  });

  describe('KPI > Average NPS', () => {
    it('should display the nps average of the existing feedbacks in tanuki', () => {
      render(KpiSectionComponent);
      expect(screen.getByTestId('kpi-average')).toHaveTextContent(/^\d+(,\d)?\/10$/); // => 0/10 | 0,5/10 ...
    });
  });

  describe('KPI > Alerts NPS', () => {
    it('should display a list that contains only feedbacks with nps below 8', () => {
      const positiveNps = manyFeedbacks[0];
      const negativeNps = manyFeedbacks[1];
      render(
        <KpiSection initialData={[negativeNps, positiveNps]} period={period} entities={entities} />
      );
      expect(screen.queryByText(negativeNps.employee.name)).toBeInTheDocument();
      expect(screen.queryByText(positiveNps.employee.name)).not.toBeInTheDocument();
    });

    it('should display a placeholder text if there is no alert', () => {
      const positiveNps = manyFeedbacks[0];
      render(
        <KpiSection initialData={[positiveNps, positiveNps]} period={period} entities={entities} />
      );
      expect(screen.getByText("Il n'y a pas encore d'alerte.")).toBeInTheDocument();
    });

    it('should redirect to the feedback when clicking on the first alert', async () => {
      const negativeNpsFeedback = manyFeedbacks[1];
      render(
        <KpiSection initialData={[negativeNpsFeedback]} period={period} entities={entities} />
      );
      await user.click(screen.getByText(negativeNpsFeedback.employee.name));
      await waitFor(() => {
        expect(singletonRouter).toMatchObject({
          asPath: `/feedbacks/${negativeNpsFeedback.id}`,
        });
      });
    });
  });
});
