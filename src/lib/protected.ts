import { verifyToken } from './auth';
import { getCookie } from './cookies';

export async function requireAuth(request: Request) {
  try {
    const token = getCookie(request, "token");
    if (!token) {
      return { ok: false, error: 'Token no encontrado', status: 401 };
    }

    const payload = await verifyToken(token);
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'Token inválido', status: 401 };
    }

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return { ok: false, error: 'Token expirado', status: 401 };
    }

    return { ok: true, user: payload };
  } catch (err) {
    return { ok: false, error: 'Error de autenticación', status: 401 };
  }
}