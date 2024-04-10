import { render, screen } from '@testing-library/react';
import BackArrow from 'components/common/BackArrow';
import userEvent from '@testing-library/user-event';

const mockHandleSelect = jest.fn();

describe('the back arrow component', () => {
  it('should render', () => {
    render(<BackArrow onSelect={() => {}} />);

    expect(screen.getByLabelText('retourner à la page précédente')).toBeInTheDocument();
  });

  it('should call the function passed as props when clicked', async () => {
    render(<BackArrow onSelect={mockHandleSelect} />);

    await userEvent.click(screen.getByLabelText('retourner à la page précédente'));

    expect(mockHandleSelect).toHaveBeenCalled();
  });
});
