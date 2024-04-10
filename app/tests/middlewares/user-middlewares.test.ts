import { NextFunction, Request, Response } from 'express';
import { userDataMiddleware } from 'middlewares/user-middlewares';
import * as userService from 'services/users-service';
import { User } from '@prisma/client';
import { managerUser } from 'mockData/users';

describe('User middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    mockRequest = {
      headers: {
        'x-goog-authenticated-user-email': 'accounts.google.com:john.doe@hubvisory.com',
      },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      locals: {
        user: managerUser,
      },
    };
  });

  it('should continue request lifecycle if user is in database', async () => {
    const spy = jest.spyOn(userService, 'checkUserAndCreate');
    spy.mockImplementation(async (_email): Promise<User | null> => managerUser);

    await userDataMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.locals?.user).toEqual(managerUser);
    expect(spy).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should create user data if user is only found in employee collection, and continue request lifecycle', async () => {
    const spy = jest.spyOn(userService, 'checkUserAndCreate');
    spy.mockImplementation(async (_email): Promise<User | null> => managerUser);

    await userDataMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if user is neither in user nor employee collection', async () => {
    const spy = jest.spyOn(userService, 'checkUserAndCreate');
    spy.mockImplementation(async (_email): Promise<User | null> => null);
    await userDataMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.locals?.user).toEqual(null);
  });
});
