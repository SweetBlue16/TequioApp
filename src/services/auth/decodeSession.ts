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
    const userId = Number(payload.sub ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
    const roleName = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const roleIds: Record<string, number> = { Buyer: 1, Producer: 2, Admin: 3, MasterAdmin: 4 };
    const roleId = Number(payload.roleId ?? (typeof roleName === 'string' ? roleIds[roleName] : undefined));
    const expiresAt = Number(payload.exp) * 1000;
    if (!Number.isSafeInteger(userId) || userId <= 0 || !Number.isSafeInteger(roleId) || roleId <= 0 || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return { token, userId, roleId, expiresAt };
  } catch {
    return null;
  }
}
