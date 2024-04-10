import styles from 'styles/components/client/ClientForm.module.scss';
import Combobox from 'components/Combobox';
import { useAlert } from 'components/common/Alert/AlertProvider';
import Button from 'components/common/Button';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Employee } from '@prisma/client';
import TextInput from 'components/common/TextInput';
import { CreateClientData, Client } from 'types/client';
import useLazyFetch from 'hooks/lazy-fetch';
import { AccountWithACMA } from 'types/account';

const ClientForm = ({ ACMAs, accounts, clients, onCancel, onValidation }: ClientFormProps) => {
  const [selectedAccount, setSelectedAccount] = useState<AccountWithACMA | null>(null);
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedACMA, setSelectedACMA] = useState<Employee | null | undefined>(null);
  const [existingAccountACMA, setExistingAccountACMA] = useState<Employee | null>(null);
  const [details, setDetails] = useState<string>('');
  const { createAlert } = useAlert();
  const { post } = useLazyFetch();

  const isEmailTaken = useMemo(() => {
    return email.trim()
      ? clients.map(c => c.email?.trim().toLowerCase()).indexOf(email.trim().toLowerCase()) >= 0
      : false;
  }, [clients, email]);

  const isClientNameTaken = useMemo(() => {
    return fullName.trim() && selectedAccount
      ? clients
          .filter(c => c.accountId === selectedAccount.id)
          .map(c => c.name.trim().toLowerCase())
          .indexOf(fullName.trim().toLowerCase()) >= 0
      : false;
  }, [clients, fullName, selectedAccount]);

  const isFormValid =
    (selectedAccount || newAccountName.trim()) &&
    fullName.trim() &&
    !isClientNameTaken &&
    selectedACMA &&
    (!email || (email.trim() && !isEmailTaken));

  const handleCreation = async (event: FormEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (!isFormValid) {
      return createAlert(
        'error',
        'Veuillez vérifier que tous les champs obligatoires sont remplis et valides.'
      );
    }

    const newClient: CreateClientData = {
      ...(selectedAccount
        ? { accountId: selectedAccount.id }
        : {
            accountData: {
              name: newAccountName,
              accountManagerId: selectedACMA?.id,
            },
          }),
      name: fullName.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(details.trim() ? { details } : {}),
    };

    try {
      const response = await post('/api/clients', newClient);

      if (response.status === 201) {
        const newClientResponse = (await response.json()) as Client;
        onValidation(newClientResponse);
      } else {
        throw new Error((await response.json()).error.message);
      }
    } catch (error) {
      createAlert(
        'error',
        `Nous n'avons pas réussi à créer le nouveau client: ${(error as Error).message}`
      );
    }
  };

  const handleChangeAccount = (
    value: string | AccountWithACMA | null,
    textValue: string,
    reason?: '' | 'select' | 'type' | undefined
  ) => {
    if (reason === 'type') {
      if (textValue.length > 1) {
        const currentIndex = accounts
          .map(account => account.name.toLowerCase())
          .indexOf(textValue.toLowerCase());
        if (currentIndex >= 0) {
          newAccountName !== '' && setNewAccountName('');
          setSelectedAccount(accounts[currentIndex]);
        } else if (textValue !== newAccountName) {
          setNewAccountName(textValue);
          selectedAccount !== null && setSelectedAccount(null);
          existingAccountACMA !== null && setExistingAccountACMA(null);
        }
      } else if (textValue.length <= 1) {
        textValue !== newAccountName && setNewAccountName('');
        selectedAccount !== null && setSelectedAccount(null);
      }
    } else if (reason === 'select' && typeof value !== 'string') {
      value !== selectedAccount && setSelectedAccount(value);
      newAccountName !== '' && setNewAccountName('');
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      setExistingAccountACMA(selectedAccount.accountManager);
    }
  }, [selectedAccount]);

  return (
    <form onSubmit={handleCreation} className={styles.clientForm}>
      <fieldset className={styles.fieldSetForm}>
        <div className={`${styles.standardField} ${styles.field}`}>
          <label htmlFor="account" className={styles.mandatory}>
            Compte
          </label>
          <span className={styles.infoCreateAccount}>
            Si le compte ne figure pas dans la liste, il sera automatiquement créé
          </span>
          <div className={styles.standardField}>
            <Combobox<AccountWithACMA>
              id="account"
              disableClearable
              options={accounts}
              getOptionLabel={option => option.name || ''}
              freeSolo
              onChange={handleChangeAccount}
              placeHolder="Sélectionner ou créer un compte"
              keyToCompare="id"
            />
          </div>
        </div>
        <div className={`${styles.standardField} ${styles.field}`}>
          <label htmlFor="acma" className={styles.mandatory}>
            ACMA
          </label>
          <Combobox<Employee>
            id="acma"
            disableClearable
            placeHolder="Sélectionner un ACMA"
            options={ACMAs}
            watchValue={existingAccountACMA || undefined}
            disabled={selectedAccount !== null}
            getOptionLabel={option => option.name}
            onChange={value => typeof value !== 'string' && setSelectedACMA(value)}
            keyToCompare="id"
          />
        </div>
        <div className={`${styles.standardField} ${styles.field}`}>
          <div className={styles.labelWrapper}>
            <label htmlFor="full-name" className={styles.mandatory}>
              Interlocuteur
            </label>
            {isClientNameTaken && (
              <span className={styles.error}>
                Cet interlocuteur est déjà associé à un compte client
              </span>
            )}
          </div>
          <TextInput
            id="full-name"
            className="form-field"
            error={isClientNameTaken}
            required
            placeholder="Saisir le nom complet"
            variant="outlined"
            onChange={event => setFullName(event.target.value)}
          />
        </div>
        <div className={`${styles.standardField} ${styles.field}`}>
          <div className={styles.labelWrapper}>
            <label htmlFor="email">Email</label>
            {isEmailTaken && <span className={styles.error}>Cette adresse email existe déjà</span>}
          </div>
          <TextInput
            id="email"
            error={isEmailTaken}
            placeholder="Saisir l'email de l'interlocuteur"
            className="form-field"
            variant="outlined"
            type="email"
            onChange={event => setEmail(event.target.value)}
          />
        </div>
        <div className={`${styles.largeField} ${styles.field}`}>
          <label htmlFor="details">Autres informations</label>
          <TextInput
            id="details"
            placeholder="Saisir d'autres informations"
            multiline
            variant="outlined"
            minRows={2}
            maxRows={3}
            onChange={event => setDetails(event.target.value)}
          />
        </div>
      </fieldset>
      <div className={styles.buttons}>
        <Button type="button" onClick={onCancel} stylePreset="outlined">
          Annuler
        </Button>
        <Button disabled={!isFormValid} type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export interface ClientFormProps {
  ACMAs: Employee[];
  accounts: AccountWithACMA[];
  clients: Client[];
  onCancel: () => void;
  onValidation: (data: Client) => void;
}

export default ClientForm;
