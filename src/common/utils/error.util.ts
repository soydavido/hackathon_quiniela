import { HttpException, UnprocessableEntityException, Logger } from '@nestjs/common';

export function handleErrorWrapper(
  e: any,
  defaultMessage: string,
  logger?: Logger,
): never {
  const msg = e?.message ?? String(e);
  try {
    (logger ?? new Logger('ErrorUtil')).error(msg);
  } catch {}
  if (e instanceof HttpException) {
    throw e;
  }
  throw new UnprocessableEntityException(msg || defaultMessage);
}
