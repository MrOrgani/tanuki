import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Paginator from 'components/common/Paginator';

describe('the Paginator component', () => {
  const user = userEvent.setup();
  const perPageOptions = [10, 25, 50];
  const defaultPerPage = perPageOptions[0];

  it('should call an updatePage callback when skipping page from 1 to 4', async () => {
    const updatePage = jest.fn((page: number) => page.toString());

    render(
      <Paginator
        page={1}
        perPage={defaultPerPage}
        perPageOptions={perPageOptions}
        elementCount={75}
        onChangePage={updatePage}
        onChangePerPage={() => {}}
      />
    );

    await user.click(screen.getByText('4'));
    expect(updatePage).toHaveBeenCalledWith(4);
  });

  it('should call an updatePage callback when jumping to next page from 1', async () => {
    const updatePage = jest.fn((page: number) => page.toString());

    render(
      <Paginator
        page={1}
        perPage={defaultPerPage}
        perPageOptions={perPageOptions}
        elementCount={75}
        onChangePage={updatePage}
        onChangePerPage={() => {}}
      />
    );

    await user.click(screen.getByLabelText('suivant'));
    expect(updatePage).toHaveBeenCalledWith(2);
  });

  it('should call an updatePerPage callback when selecting a perPage option', async () => {
    const updatePerPage = jest.fn((perPage: number) => perPage.toString());

    render(
      <Paginator
        page={1}
        perPage={defaultPerPage}
        perPageOptions={perPageOptions}
        elementCount={75}
        onChangePage={() => {}}
        onChangePerPage={updatePerPage}
      />
    );

    await user.click(screen.getByRole('button', { name: defaultPerPage.toString() }));
    await user.click(await screen.findByRole('option', { name: perPageOptions[1].toString() }));
    expect(updatePerPage).toHaveBeenCalledWith(perPageOptions[1]);
  });

  it('should display 3 pages for 75 elements with 25 elements per page', () => {
    render(
      <Paginator
        page={1}
        perPage={perPageOptions[1]}
        perPageOptions={perPageOptions}
        elementCount={75}
        onChangePage={() => {}}
        onChangePerPage={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument();
  });
});
