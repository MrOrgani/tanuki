import { RoleType, User } from '@prisma/client';
import { createContext, ReactNode, useContext } from 'react';

interface UserContextData {
  user: User;
  hasRole: (role: RoleType) => boolean;
}

interface UserProviderProps {
  user: User;
  children: ReactNode;
}

export const UserContext = createContext<UserContextData>({} as UserContextData);

const UserProvider = ({ user, children }: UserProviderProps): JSX.Element => {
  const hasRole = (role: RoleType) => user.role === role;

  return (
    <UserContext.Provider
      value={{
        user,
        hasRole,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserProvider;
