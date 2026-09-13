import { Response, Request } from 'express';

export function setAuthCookie(res: any, token: string) {
  if (typeof res.cookie === 'function') {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  } else {
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secureFlag}`
    );
  }
}

export function clearAuthCookie(res: any) {
  if (typeof res.clearCookie === 'function') {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } else {
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`
    );
  }
}

export function getAuthToken(req: any): string | null {
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  if (req.headers && req.headers.cookie) {
    const match = req.headers.cookie.match(/auth_token=([^;]+)/);
    if (match) return match[1];
  }
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
}
