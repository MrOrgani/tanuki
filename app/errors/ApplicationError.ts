import { ErrorCode, ErrorProps, ErrorType } from 'types/errors';

export default class ApplicationError extends Error {
  code: ErrorCode;
  context: string | undefined;

  constructor(code: ErrorCode, message: string, context?: string, nativeError?: Error) {
    super(message || nativeError?.message);
    this.code = code;
    this.context = context;
    this.stack = nativeError?.stack;
    this.name = nativeError?.name || code.toString();
  }

  getErrorProps(): ErrorProps {
    return {
      props: {
        error: this.toJson(),
      },
    };
  }

  toJson(): ErrorType {
    return { statusCode: this.code, message: this.message };
  }
}
