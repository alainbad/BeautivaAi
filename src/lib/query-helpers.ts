import type { ApiResponse } from "@/server/lib/response";

/** Unwraps a server function's ApiResponse envelope for use inside useQuery/useMutation. */
export async function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const res = await promise;
  if (!res.success) throw new Error(res.error);
  return res.data;
}
