import { decodeSession } from '../decodeSession';

describe('Session decoding supports the claims emitted by the TEQUIO API', () => {
  it('restores an administrator using the existing JWT provider claim names', () => {
    const payload = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '23',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    expect(decodeSession(`header.${btoa(JSON.stringify(payload))}.signature`)).toEqual(expect.objectContaining({ userId: 23, roleId: 3 }));
  });

  it('rejects an unrecognized role instead of granting access', () => {
    const payload = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': '23',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Unknown',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    expect(decodeSession(`header.${btoa(JSON.stringify(payload))}.signature`)).toBeNull();
  });
});
