export interface ErrorProps {
  props: {
    error: ErrorType;
  };
}

export interface ErrorType {
  statusCode: number;
  message: string;
}

export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
