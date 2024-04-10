/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/react';
import HubvisorCard from 'components/profile/HubvisorCard';
import { consultant } from 'mockData/employees';
import { toDisplayDateFormat } from 'utils/date';

describe('The HubvisorCard component in the profile page', () => {
  const HubvisorCardComponent = <HubvisorCard hubvisor={consultant} />;
  it('should display the hubvisor card title', () => {
    render(HubvisorCardComponent);
    expect(screen.getByText('Hubvisor')).toBeInTheDocument();
  });

  it('should display the hubvisor card with the correct data', () => {
    render(HubvisorCardComponent);
    expect(screen.getByText('Mocked Avatar Component')).toBeInTheDocument();
    expect(screen.getByText(consultant.name)).toBeInTheDocument();
    expect(screen.getByText(consultant.position)).toBeInTheDocument();
    expect(
      screen.getByText(`Arrivé le ${toDisplayDateFormat(consultant.contractStartDate!)}`)
    ).toBeInTheDocument();
    expect(screen.getByText(consultant.manager!.name)).toBeInTheDocument();
  });
});
