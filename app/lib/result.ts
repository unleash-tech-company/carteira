export type AppResult<TData, TError> = readonly [TData, never] | readonly [never, TError]
export function ok<TData, TError>(data: TData): AppResult<TData, TError> {
  return [data, undefined as never] as const
}
export function err<TData, TError>(error: TError): AppResult<TData, TError> {
  return [undefined as never, error] as const
}
export function panic<TError extends { message: string }>(error: TError): void {
  console.error(error.message)
}

export async function fromPromise<TData, TError>(
  promise: Promise<TData>,
  errorHandler: (error: unknown) => TError
): Promise<AppResult<TData, TError>> {
  try {
    const data: Awaited<TData> = await promise
    return ok(data)
  } catch (error) {
    return err(errorHandler(error))
  }
}
export async function fromCallback<TData, TError>(
  callback: () => Promise<TData>,
  errorHandler: (error: unknown) => TError
): Promise<AppResult<TData, TError>> {
  try {
    const data: Awaited<TData> = await callback()
    return ok(data)
  } catch (error) {
    return err(errorHandler(error))
  }
}
