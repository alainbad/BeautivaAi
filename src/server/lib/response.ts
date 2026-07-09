// Shared API envelope — every server function returns one of these two shapes.

export type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function fail(error: string): ApiResponse<never> {
  return { success: false, data: null, error };
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Wrap a handler so thrown errors become a `fail()` envelope instead of a 500. */
export async function toApiResponse<T>(run: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    return ok(await run());
  } catch (error) {
    if (error instanceof AppError) return fail(error.message);
    console.error(error);
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}
