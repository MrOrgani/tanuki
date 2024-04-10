import { RoleType, User } from '@prisma/client';
import ApplicationError from 'errors/ApplicationError';
import { Response } from 'express';
import { NextPageContext } from 'next';
import { ErrorCode } from 'types/errors';
import logger from 'utils/logger';

const withRoleGuardServerSideProps = (
  getServerSidePropsHandler?: ((arg0: NextPageContext, arg1: User) => Record<string, any>) | null,
  roles?: RoleType[]
) => {
  return async (context: NextPageContext) => {
    try {
      const { user } = (context.res as Response).locals;

      if (!user) {
        throw new ApplicationError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 'SidePropMiddleware');
      }

      if (roles && !roles.includes(user.role)) {
        throw new ApplicationError(ErrorCode.FORBIDDEN, 'Access denied', 'SidePropMiddleware');
      }

      if (getServerSidePropsHandler) {
        const pageProperty = await getServerSidePropsHandler(context, user);

        return {
          ...pageProperty,
          props: {
            ...pageProperty.props,
            user,
          },
        };
      }

      return { props: { user } };
    } catch (e) {
      if (e instanceof ApplicationError) {
        logger.warn(`[${e.context}] - ${e.message}`);
        return e.getErrorProps();
      }
      logger.error((e as Error).message);
      return {
        props: { error: { statusCode: 500, message: 'Une erreur est survenue' } },
      };
    }
  };
};

export default withRoleGuardServerSideProps;
