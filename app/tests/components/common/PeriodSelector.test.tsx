import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PeriodSelector from 'components/common/PeriodSelector';
import { DateInterval, PeriodOption } from 'types/date';

describe('The PeriodSelector component', () => {
  const user = userEvent.setup();
  const periodOptions: PeriodOption[] = [
    {
      label: 'Demain',
      key: 'a',
      range: { start: new Date('2021-12-02'), end: new Date('2021-12-02') },
    },
    {
      label: 'Hier',
      key: 'b',
      range: { start: new Date('2021-10-20'), end: new Date('2021-10-20') },
    },
    {
      label: 'Ce mois',
      key: 'c',
      range: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
    },
  ];

  it('should display options props', async () => {
    render(<PeriodSelector onChangePeriod={() => {}} options={periodOptions} />);

    await user.click(screen.getByRole('button', { name: 'Demain' }));
    expect(await screen.findByText('Hier')).toBeInTheDocument();
    expect(await screen.findByText('Ce mois')).toBeInTheDocument();
  });

  it('should display a default selected value provided in the options props', async () => {
    const options = [
      ...periodOptions,
      {
        label: 'Test option',
        key: 'test',
        range: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
        selected: true,
      },
    ];

    render(<PeriodSelector onChangePeriod={() => {}} options={options} />);

    expect(await screen.findByText('Test option')).toBeInTheDocument();
  });

  it('should call an update callback with a DateInterval argument on new selection', async () => {
    const callback = jest.fn((interval: DateInterval) => interval);

    render(<PeriodSelector onChangePeriod={callback} options={periodOptions} />);

    await user.click(screen.getByRole('button', { name: 'Demain' }));
    await user.click(await screen.findByText(periodOptions[1].label));

    expect(callback).toHaveBeenCalledWith(periodOptions[1].range);
  });
});
