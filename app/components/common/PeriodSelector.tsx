import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import { forwardRef, useMemo } from 'react';
import { DateInterval, PeriodOption } from 'types/date';
import Cookies from 'js-cookie';
import { COOKIE_NAME_PERIOD } from 'utils/constants';

interface PeriodSelectorProps extends SelectProps {
  options: PeriodOption[];
  onChangePeriod: (interval: DateInterval) => void;
  theme?: 'primary' | 'default';
}

const getTheme = (theme: 'primary' | 'default') => {
  switch (theme) {
    case 'primary':
      return {
        '& legend': { display: 'none' },
        '& fieldset': { top: 0, borderColor: '#0073E0' },
        '& svg': { color: '#0073E0' },
        color: '#0073E0',
        fontWeight: 700,
      };
    case 'default':
      return {
        '& legend': { display: 'none' },
        '& fieldset': { top: 0, borderColor: '#E6E8EA' },
        '& svg': { color: '#666565' },
        color: '#666565',
      };
    default:
      return {};
  }
};

const PeriodSelector = forwardRef(
  ({ onChangePeriod, options, theme = 'primary', ...props }: PeriodSelectorProps, ref) => {
    const defaultValue = useMemo(() => options.findIndex(option => option.selected), [options]);

    const handleChange = (e: SelectChangeEvent<unknown>) => {
      const selectedPeriod = options[parseInt(e.target.value as string)];
      onChangePeriod(selectedPeriod.range);
      Cookies.set(COOKIE_NAME_PERIOD, selectedPeriod.key);
    };

    return (
      <Select
        aria-label="Période"
        ref={ref}
        defaultValue={defaultValue > 0 ? defaultValue : 0}
        onChange={handleChange}
        fullWidth={true}
        sx={getTheme(theme)}
        {...props}>
        {options.map((option, index) => (
          <MenuItem key={option.key} value={index}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    );
  }
);

PeriodSelector.displayName = 'PeriodSelector';

export default PeriodSelector;
