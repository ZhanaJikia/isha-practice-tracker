import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export type LoginOk = {
  kind: "ok";
  user: { id: string; username: string; createdAt: Date };
  token: string;
  expiresAt: Date;
};

export type LoginErr = { kind: "invalid_credentials" };

export type LoginResult = LoginOk | LoginErr;

export async function login(params: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  const { username, password } = params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, passwordHash: true, createdAt: true },
  });

  if (!user) return { kind: "invalid_credentials" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { kind: "invalid_credentials" };

  const { token, expiresAt } = await createSession(user.id);

  return {
    kind: "ok",
    user: { id: user.id, username: user.username, createdAt: user.createdAt },
    token,
    expiresAt,
  };
}

