import { render, screen } from '@testing-library/react';
import CheckboxElement from 'components/common/Checkbox';

describe('the checkbox component', () => {
  it('should render unchecked with the label passed as props', () => {
    expect.assertions(2);
    render(<CheckboxElement label="à faire" onChange={() => {}} />);

    const checkbox = screen.getByLabelText('à faire');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked if the checked property is used', () => {
    expect.assertions(1);
    render(<CheckboxElement label="à faire" checked onChange={() => {}} />);

    expect(screen.getByLabelText('à faire')).toBeChecked();
  });
});
