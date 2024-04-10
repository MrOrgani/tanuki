import { render, screen } from '@testing-library/react';

import Alert from 'components/common/Alert/Alert';

describe('The Alert component', () => {
  it('should display an icon', () => {
    render(<Alert>Test content</Alert>);
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });
  it('should display a message with the children text content', () => {
    render(<Alert>Test content</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Test content');
  });
});
