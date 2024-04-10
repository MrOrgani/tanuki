import { act, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Multiselect from 'components/common/Multiselect';

describe('the multi select component', () => {
  const renderMultiselect = () => {
    render(
      <Multiselect<string>
        options={['foo', 'bar', 'baz']}
        defaultValues={['foo', 'baz']}
        getOptionLabel={option => option}
        id="multiselect"
        label="sélectionner un élément"
        handleChange={() => {}}
      />
    );
  };

  const user = userEvent.setup();

  it('should display', () => {
    renderMultiselect();

    expect(screen.getByRole('combobox', { name: 'sélectionner un élément' })).toBeInTheDocument();
  });

  it('should display a text field containing all default values separated by a comma', () => {
    renderMultiselect();

    expect(screen.getByRole('combobox')).toHaveValue('foo, baz');
  });

  it('should display a dropdown with all options sorted by alphabetical order on click, selected options should be checked', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));

    expect(await screen.findByRole('combobox', { expanded: true })).toBeInTheDocument();

    const options = screen.getAllByRole('checkbox');

    expect(options[0]).toHaveAccessibleName('bar');
    expect(options[1]).toHaveAccessibleName('baz');
    expect(options[2]).toHaveAccessibleName('foo');

    expect(screen.getByRole('checkbox', { name: 'foo' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'bar' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'baz' })).toBeChecked();
  });

  it('should collapse when clicking the textbox a second time', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByRole('combobox')));

    expect(await screen.findByRole('combobox', { expanded: false })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('should display an unselect all button, selecting it removes all values from the text field', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));

    const unselectAllOption = screen.getByRole('button', { name: 'Effacer la sélection (2)' });

    expect(unselectAllOption).toBeInTheDocument();

    await act(() => user.click(unselectAllOption));

    expect(await screen.findByRole('combobox')).toHaveValue('');
  });

  it('should collapse when clicking outside', async () => {
    const textElementContent = 'Outside combobox';

    render(
      <>
        <p>{textElementContent}</p>
        <Multiselect<string>
          options={['foo', 'bar', 'baz']}
          defaultValues={[]}
          getOptionLabel={option => option}
          id="multiselect"
          label="sélectionner un élément"
          handleChange={() => {}}
        />
      </>
    );

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByText(textElementContent)));

    await waitFor(() => {
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    expect(await screen.findByRole('combobox', { expanded: false })).toBeInTheDocument();
  });

  it('should display a select all button when value is empty, selecting it displays all possible values in the text field, in alphabetical order', async () => {
    render(
      <Multiselect<string>
        options={['foo', 'bar', 'baz']}
        defaultValues={[]}
        getOptionLabel={option => option}
        id="multiselect"
        label="sélectionner un élément"
        handleChange={() => {}}
      />
    );

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByRole('button', { name: /Tout sélectionner/ })));

    expect(screen.getByRole('combobox')).toHaveValue('bar, baz, foo');
  });

  it('should add the selected option to the text field values', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByRole('checkbox', { name: 'bar' })));

    expect(screen.getByRole('combobox')).toHaveValue('bar, baz, foo');
  });

  it('should remove the selected option from the text field values', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.click(screen.getByRole('checkbox', { name: 'baz' })));

    expect(screen.getByRole('combobox')).toHaveValue('foo');
  });

  it('should not display a searchbox', async () => {
    renderMultiselect();

    await act(() => user.click(screen.getByRole('combobox')));
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('should display a searchbox with the placeholder text "Rechercher"', async () => {
    render(
      <Multiselect<string>
        options={['foo', 'bar', 'baz']}
        defaultValues={['foo', 'baz']}
        getOptionLabel={option => option}
        id="multiselect"
        label="sélectionner un élément"
        handleChange={() => {}}
        searchLabel="Rechercher"
      />
    );

    await act(() => user.click(screen.getByRole('combobox')));
    expect(screen.getByRole('searchbox', { name: 'Rechercher' })).toBeInTheDocument();
  });

  it('should only display options "bar" and "baz" when user searches "ba", then display all options when searchbox is cleared', async () => {
    render(
      <Multiselect<string>
        options={['foo', 'bar', 'baz']}
        defaultValues={['foo', 'baz']}
        getOptionLabel={option => option}
        id="multiselect"
        label="sélectionner un élément"
        handleChange={() => {}}
        searchLabel="Rechercher"
      />
    );

    await act(() => user.click(screen.getByRole('combobox')));
    await act(() => user.type(screen.getByRole('searchbox', { name: 'Rechercher' }), 'ba'));

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: 'foo' })).not.toBeInTheDocument();
    });

    expect(screen.getByRole('checkbox', { name: 'baz' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'bar' })).toBeInTheDocument();

    await act(() =>
      user.type(screen.getByRole('searchbox', { name: 'Rechercher' }), '{backspace}{backspace}')
    );

    expect(await screen.findByRole('checkbox', { name: 'foo' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'bar' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'baz' })).toBeInTheDocument();
  });

  it('should display an image next to each label', async () => {
    render(
      <Multiselect<string>
        options={['foo', 'bar', 'baz']}
        defaultValues={['foo', 'baz']}
        getOptionLabel={option => option}
        id="multiselect"
        label="sélectionner un élément"
        handleChange={() => {}}
        getOptionNode={optionLabel => {
          return (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={optionLabel} src="" />
              {optionLabel}
            </>
          );
        }}
      />
    );

    await act(() => user.click(screen.getByRole('combobox')));

    expect(screen.getByAltText('foo')).toBeInTheDocument();
    expect(screen.getByAltText('bar')).toBeInTheDocument();
    expect(screen.getByAltText('baz')).toBeInTheDocument();
  });
});
