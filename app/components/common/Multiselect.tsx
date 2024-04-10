import debounce from 'lodash.debounce';
import {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import styles from 'styles/components/common/Multiselect.module.scss';
import CheckboxWithLabel from './Checkbox';
import ChevronDown from 'assets/icons/chevron-down.svg';
import { useRef } from 'react';
import Search from 'assets/icons/search.svg';

export interface MultiselectProps<T> extends ComponentPropsWithoutRef<'select'> {
  defaultValues: T[];
  options: T[];
  getOptionLabel: (option: T) => string;
  id: string;
  label: string;
  handleChange: (values: T[]) => void;
  searchLabel?: string;
  getOptionNode?: (option: T, optionLabel: string) => ReactNode;
  theme?: 'default' | 'primary';
}

function Multiselect<T>({
  defaultValues,
  options,
  getOptionLabel,
  id,
  label,
  handleChange,
  searchLabel,
  getOptionNode = (option, optionLabel) => optionLabel,
  theme = 'default',
}: MultiselectProps<T>) {
  const [displayedOptions, setDisplayedOptions] = useState(
    options.sort((a, b) => (getOptionLabel(a) < getOptionLabel(b) ? -1 : 1))
  );
  const [selectedValues, setSelectedValues] = useState(defaultValues);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  const serializedSelectedValues = useMemo(
    () => selectedValues.map(value => getOptionLabel(value)).join(', '),
    [selectedValues, getOptionLabel]
  );

  const toggleDropdown = useCallback(() => setIsExpanded(state => !state), []);

  const handleKeyboard = useCallback(
    () => (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        toggleDropdown();
      }
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    },
    [isExpanded, toggleDropdown]
  );

  const unselectAll = useCallback(() => setSelectedValues([]), []);
  const selectAll = useCallback(() => setSelectedValues(options), [options]);

  const handleSelect = (option: T) => {
    return selectedValues.includes(option)
      ? setSelectedValues(values => [...values].filter(value => value !== option))
      : setSelectedValues(values => {
          return [...values, option].sort((a, b) =>
            getOptionLabel(a) < getOptionLabel(b) ? -1 : 1
          );
        });
  };

  const handleSearch = debounce(() => {
    if (searchQuery.length) {
      setDisplayedOptions(
        options
          .filter(option =>
            getOptionLabel(option).toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 2)
          .sort((a, b) => (getOptionLabel(a) < getOptionLabel(b) ? -1 : 1))
      );
    } else {
      setDisplayedOptions(options.sort((a, b) => (getOptionLabel(a) < getOptionLabel(b) ? -1 : 1)));
    }
  }, 250);

  useEffect(() => {
    handleChange(selectedValues);
  }, [selectedValues, handleChange]);

  useEffect(() => {
    if (isExpanded && searchQuery.length) {
      searchInput.current?.focus();
    }
  }, [isExpanded, searchQuery.length]);

  useEffect(() => {
    handleSearch();
    return () => handleSearch.cancel();
  }, [searchQuery, handleSearch]);

  return (
    <div
      className={`${styles.Multiselect} ${styles[theme]} ${isExpanded ? styles.expanded : ''}`}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsExpanded(false);
        }
      }}>
      <div className={styles.selectedOptions}>
        <input
          type="text"
          value={serializedSelectedValues}
          onClick={toggleDropdown}
          onKeyUp={handleKeyboard}
          readOnly
          role="combobox"
          aria-expanded={isExpanded}
          aria-controls={`${id}-dropdown`}
          aria-label={label}
          placeholder={label}
        />
        <ChevronDown className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`} />
      </div>

      {isExpanded && (
        <div id={`${id}-dropdown`} className={styles.dropdown}>
          <hr />
          {searchLabel && searchLabel.length && (
            <div className={styles.searchBox}>
              <input
                type="search"
                aria-label={searchLabel}
                placeholder={searchLabel}
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
                ref={searchInput}
              />
              <Search />
            </div>
          )}
          {selectedValues.length ? (
            <button onClick={unselectAll} className={styles.unselectAll}>
              Effacer la sélection ({selectedValues.length})
            </button>
          ) : (
            <button onClick={selectAll} className={styles.unselectAll}>
              Tout sélectionner ({options.length})
            </button>
          )}
          <div className={`${styles.options} ${options.length > 3 && styles.scrollable}`}>
            {displayedOptions.map(option => {
              const optionLabel = getOptionLabel(option);
              const isSelected = selectedValues.includes(option);

              return (
                <div
                  key={optionLabel}
                  className={`${styles.option} ${isSelected && styles.selected}`}
                  tabIndex={-1}>
                  <CheckboxWithLabel
                    label={getOptionNode(option, getOptionLabel(option))}
                    checked={isSelected}
                    onChange={() => handleSelect(option)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Multiselect;
