import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HubvisorTable from 'components/profile/HubvisorTable';
import { manyFeedbacks } from 'mockData/feedbacks';
import { act } from 'react-dom/test-utils';
import { toDisplayDateFormat } from 'utils/date';

describe('The HubvisorTable component in the profile page', () => {
  const user = userEvent.setup();
  const onSort = jest.fn();
  const HubvisorTableComponent = <HubvisorTable feedbacks={[manyFeedbacks[0]]} onSort={onSort} />;

  it('should display the following table headers : Hubvisor, NPS, Compte, Interlocuteur, Date', () => {
    render(HubvisorTableComponent);
    expect(screen.getByText('Hubvisor')).toBeInTheDocument();
    expect(screen.getByText('NPS')).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
    expect(screen.getByText('Interlocuteur')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('should have sortable headers (NPS, Compte, Interlocuteur, Date)', () => {
    render(HubvisorTableComponent);
    expect(screen.getByLabelText('Trier par NPS')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par compte')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par interlocuteur')).toBeInTheDocument();
    expect(screen.getByLabelText('Trier par date')).toBeInTheDocument();
  });

  it('should display the hubvisor cell with the correct format', () => {
    render(HubvisorTableComponent);
    expect(screen.getByText('Mocked Avatar Component')).toBeInTheDocument();
    expect(screen.getByText(manyFeedbacks[0].employee.name)).toBeInTheDocument();
  });

  it('should display the nps cell with the correct format', () => {
    render(HubvisorTableComponent);
    expect(screen.getByText(`${manyFeedbacks[0].answers.grade}/10`)).toBeInTheDocument();
  });

  it('should display the date cell with the correct format', () => {
    render(HubvisorTableComponent);
    expect(screen.getByText(toDisplayDateFormat(manyFeedbacks[0].date))).toBeInTheDocument();
  });

  it('should be able to sort the table by clicking on the sortable headers', async () => {
    render(HubvisorTableComponent);

    await act(async () => {
      await user.click(screen.getByLabelText('Trier par NPS'));
      await user.click(screen.getByLabelText('Trier par compte'));
      await user.click(screen.getByLabelText('Trier par interlocuteur'));
      await user.click(screen.getByLabelText('Trier par date'));
    });

    expect(onSort).toHaveBeenCalledTimes(4);
  });
});
