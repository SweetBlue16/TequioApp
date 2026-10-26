export interface Session {
  token: string;
  userId: number;
  roleId: number;
  expiresAt: number;
}

// The decoded payload is only for UI state. The API validates the JWT signature.
export function decodeSession(token: string | null): Session | null {
  if (!token || token.split('.').length !== 3) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    const userId = Number(payload.sub);
    const roleId = Number(payload.roleId);
    const expiresAt = Number(payload.exp) * 1000;
    if (!Number.isSafeInteger(userId) || userId <= 0 || !Number.isSafeInteger(roleId) || roleId <= 0 || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return { token, userId, roleId, expiresAt };
  } catch {
    return null;
  }
}
