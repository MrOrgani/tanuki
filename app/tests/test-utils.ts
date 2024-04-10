import { User } from '@prisma/client';
import { ServerResponse } from 'http';
import { adminUser } from 'mockData/users';

/*
Params :
  textContent : String --> text to verify
  exact: boolean --> if we want to verify the full text content or partially

The function will check if the textContent is contained in the Element by ignoring his children nodes
*/
export function textContentMatcher(text: string) {
  return function (_: unknown, node: Element | null) {
    const hasText = (node: Node) => node.textContent === text;
    const nodeHasText = node ? hasText(node) : false;
    const childrenDontHaveText = Array.from(node?.children || []).every(child => !hasText(child));
    return nodeHasText && childrenDontHaveText;
  };
}

export function startMsw(handlers: any) {
  const { setupServer } = require('msw/node');
  const server = setupServer(...handlers);
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
}

interface Response extends ServerResponse {
  locals?: {
    user: User;
  };
}

export const responsePatcherWithUser = (user: User) => (res: Response) => {
  res.locals = { user };
};

export const responsePatcher = responsePatcherWithUser(adminUser);
