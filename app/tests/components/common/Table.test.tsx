import { render, screen } from '@testing-library/react';
import Table, { Column } from 'components/common/Table';

interface IData {
  name: string;
  email: string;
}

describe('The Table component', () => {
  const data: IData[] = [
    { name: 'John Malkovich', email: 'john.malkovich@beaugosse.com' },
    { name: 'Hermione Granger', email: 'hgranger@hogwarts.com' },
  ];

  const colums: Column<IData>[] = [
    { label: 'Nom', propertyName: 'name', renderer: data => data.name },
    {
      label: 'Courriel',
      propertyName: 'email',
      renderer: data => data.email,
    },
  ];

  it('should display a header with provided labels', () => {
    render(<Table data={[]} uniqueKeyPrefix="email" columns={colums} stickyHeader={false} />);
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders[0].textContent).toEqual('Nom');
    expect(columnHeaders[1].textContent).toEqual('Courriel');
  });

  it('should display the provided data', () => {
    render(<Table data={data} uniqueKeyPrefix="email" columns={colums} stickyHeader={false} />);
    const cellValues = screen.getAllByRole('cell');

    expect(cellValues[0].textContent).toEqual('John Malkovich');
    expect(cellValues[1].textContent).toEqual('john.malkovich@beaugosse.com');
    expect(cellValues[2].textContent).toEqual('Hermione Granger');
    expect(cellValues[3].textContent).toEqual('hgranger@hogwarts.com');
  });

  it('should display a placeholder element when no data is provided', () => {
    render(<Table data={[]} uniqueKeyPrefix="email" columns={colums} stickyHeader={false} />);
    expect(screen.getByText("Il n'y a aucun résultat.")).toBeInTheDocument();
  });
});
