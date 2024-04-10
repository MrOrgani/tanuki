import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from 'components/common/Button';

describe('The button component', () => {
  it('should render', () => {
    expect.assertions(1);

    render(<Button onClick={() => {}}>Se connecter</Button>);
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('should not be clickable when disabled', async () => {
    expect.assertions(1);

    const onClick = jest.fn(() => {});
    render(
      <Button onClick={onClick} disabled>
        Se connecter
      </Button>
    );
    await userEvent.click(screen.getByText('Se connecter'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should call the callback passed as onClick prop when enabled and clicked', async () => {
    expect.assertions(1);

    const onClick = jest.fn(() => {});
    render(<Button onClick={onClick}>Se connecter</Button>);
    await userEvent.click(screen.getByText('Se connecter'));
    expect(onClick).toHaveBeenCalled();
  });
});
