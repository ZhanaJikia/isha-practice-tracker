import { deleteSessionByToken } from "@/lib/auth";

export async function logout(params: { token?: string | null }): Promise<{ kind: "ok" }> {
  const token = params.token ?? undefined;
  if (token) await deleteSessionByToken(token);
  return { kind: "ok" };
}

