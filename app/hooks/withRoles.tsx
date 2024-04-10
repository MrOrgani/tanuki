import { RoleType } from '@prisma/client';
import { useUser } from 'contexts/user';
import React, { FunctionComponent, PropsWithChildren, forwardRef } from 'react';

function withRoles(...roles: RoleType[]) {
  return function <P>(Component: FunctionComponent<P>) {
    return function FinalComponent(props: PropsWithChildren<P>): JSX.Element | null {
      const { user } = useUser();

      if (!user || !roles.includes(user.role)) {
        return null;
      }

      return <Component {...props} />;
    };
  };
}

export function withRolesRef(...roles: RoleType[]) {
  return function <P>(Component: FunctionComponent<P>) {
    return forwardRef(function FinalComponent(
      props: PropsWithChildren<P>,
      ref
    ): JSX.Element | null {
      const { user } = useUser();

      if (!user || !roles.includes(user.role)) {
        return null;
      }

      return <Component ref={ref} {...props} />;
    });
  };
}

export default withRoles;
