import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import TextInput from 'components/common/TextInput';

interface ComboboxProps<T> {
  options: T[];
  getOptionLabel: (option: T) => string;
  ariaLabel?: string;
  disableClearable?: boolean;
  disabled?: boolean;
  error?: string;
  freeSolo?: boolean;
  id?: string;
  label?: string;
  loading?: boolean;
  defaultValue?: T;
  placeHolder?: string;
  watchValue?: T | null;
  keyToCompare?: keyof T;
  onChange?: (value: T | string | null, textValue: string, reason?: '' | 'select' | 'type') => void;
}

export default function Combobox<T>({
  ariaLabel,
  disableClearable,
  disabled,
  error,
  freeSolo,
  label,
  loading,
  id,
  options,
  defaultValue,
  watchValue, // Valeur à utiliser pour changer la valeur par défaut du selectedValue
  onChange,
  getOptionLabel,
  placeHolder,
  keyToCompare,
}: ComboboxProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T | string | null>(defaultValue || null);
  const [textValue, setTextValue] = useState<string>('');
  const [reason, setReason] = useState<'' | 'select' | 'type'>('');

  useEffect(() => {
    if (onChange) {
      onChange(selectedValue, textValue, reason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, textValue, reason]);

  useEffect(() => {
    if (watchValue) {
      setSelectedValue(watchValue);
    }
  }, [watchValue]);

  return (
    <div className="form-field">
      <Autocomplete
        value={selectedValue}
        onChange={(event, value) => {
          value ? setSelectedValue(value) : setSelectedValue(null);
          setReason('select');
        }}
        onInputChange={(event, value) => {
          setTextValue(value);
          setReason('type');
        }}
        disableClearable={disableClearable}
        forcePopupIcon
        id={id}
        options={options}
        getOptionLabel={option => (typeof option === 'string' ? option : getOptionLabel(option))}
        disabled={disabled}
        freeSolo={freeSolo}
        renderInput={params => (
          <TextInput
            {...params}
            error={!!error}
            helperText={error}
            label={label}
            variant="outlined"
            placeholder={placeHolder}
          />
        )}
        loading={loading}
        noOptionsText="Aucun résultat"
        aria-label={ariaLabel}
        clearOnBlur={!freeSolo}
        isOptionEqualToValue={
          keyToCompare
            ? (option: T, value: T) => option[keyToCompare] === value[keyToCompare]
            : undefined
        }
      />
    </div>
  );
}
