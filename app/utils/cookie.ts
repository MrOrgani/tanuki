import { IncomingMessage } from 'http';

export const getCookie = (name: string, request?: IncomingMessage) => {
  const match = request?.headers?.cookie?.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
};
