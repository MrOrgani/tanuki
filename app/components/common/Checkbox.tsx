import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ReactNode } from 'react';

interface CheckboxWithLabelProps extends CheckboxProps {
  label: ReactNode;
}

function CheckboxWithLabel({ label, ...checkboxProps }: CheckboxWithLabelProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          {...checkboxProps}
          sx={{
            marginRight: '4px',
            width: 16,
            height: 16,
            '&.Mui-checked': {
              color: '#0073e0',
            },
            '.MuiSvgIcon-root': {
              fontSize: '24px',
            },
          }}
        />
      }
      label={label}
      sx={{
        width: '100%',
        marginLeft: 0,
        marginRight: 0,
        '.MuiTypography-root': {
          fontWeight: 500,
          paddingTop: '2px',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          marginLeft: '8px',
        },
      }}
    />
  );
}

export default CheckboxWithLabel;
