/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/react';
import HubCard from 'components/feedback/HubCard';
import { consultant } from 'mockData/employees';
import { toDisplayDateFormat } from 'utils/date';

describe('The HubCard component', () => {
  it("should display with the selected hubvisor's informations and enabled history button", () => {
    expect.assertions(5);
    render(<HubCard employee={consultant} />);
    expect(screen.getByText(consultant.name)).toBeInTheDocument();
    expect(screen.getByText(consultant.position)).toBeInTheDocument();
    expect(
      screen.getByText(`Arrivé le ${toDisplayDateFormat(consultant.contractStartDate!)}`)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voir la fiche' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voir la fiche' })).not.toHaveAttribute('disabled');
  });
});
