import { Employee } from '@prisma/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from 'components/Combobox';
import { manyEmployees } from 'mockData/employees';

const getEmployeeName = (option: Employee) => option.name;

describe('The combobox component', () => {
  const user = userEvent.setup();

  it("should display with the selected hubvisor's name", () => {
    expect.assertions(1);
    render(
      <Combobox<Employee>
        defaultValue={manyEmployees[0]}
        options={manyEmployees}
        getOptionLabel={getEmployeeName}
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('John Doe');
  });

  it('should not be editable if rendered with the disabled prop', async () => {
    expect.assertions(1);
    render(
      <Combobox<Employee>
        defaultValue={manyEmployees[0]}
        options={manyEmployees}
        getOptionLabel={getEmployeeName}
        disabled={true}
      />
    );

    await user.type(screen.getByRole('combobox'), 'aabb');
    expect(screen.getByRole('combobox')).toHaveValue('John Doe');
  });

  it('should display the label passed as props', () => {
    expect.assertions(1);
    render(
      <Combobox<Employee>
        label="Nom du Hubvisor"
        options={manyEmployees}
        getOptionLabel={getEmployeeName}
      />
    );
    expect(screen.getByLabelText('Nom du Hubvisor')).toBeInTheDocument();
  });

  it('should display a message if no matching option is found, and input value should not be kept on blur', async () => {
    expect.assertions(3);
    render(<Combobox<Employee> options={manyEmployees} getOptionLabel={getEmployeeName} />);

    await user.type(screen.getByRole('combobox'), 'aabb');
    expect(screen.getByRole('combobox')).toHaveValue('aabb');
    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('should display a popup with four options on click which narrow down to one when user types "Scott" - it should display the value upon selection', async () => {
    expect.assertions(9);
    render(<Combobox<Employee> options={manyEmployees} getOptionLabel={getEmployeeName} />);

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sourcien Hubvisory')).toBeInTheDocument();
    expect(screen.getByText('Scott Johnson')).toBeInTheDocument();
    expect(screen.getByText('Elliot Alderson')).toBeInTheDocument();

    await user.type(screen.getByRole('combobox'), 'Scott');
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Sourcien Hubvisory')).not.toBeInTheDocument();
    expect(screen.queryByText('Elliot Alderson')).not.toBeInTheDocument();
    expect(screen.getByText('Scott Johnson')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Scott Johnson'));
    expect(screen.getByRole('combobox')).toHaveValue('Scott Johnson');
  });

  it('should display an error message if rendered with the error prop', () => {
    expect.assertions(1);
    render(
      <Combobox<Employee>
        error="Please specify a Hubvisor"
        options={manyEmployees}
        getOptionLabel={getEmployeeName}
      />
    );

    expect(screen.getByText('Please specify a Hubvisor')).toBeInTheDocument();
  });
});
