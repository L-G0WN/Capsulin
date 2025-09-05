import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { verifyHash, generateToken } from '@/lib/auth';

export const POST: APIRoute = async ({ request }) => {
  const { username, password } = await request.json();
  const db = getDb();

  const [rows] = await db.execute<any[]>(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  const user = rows && rows.length > 0 ? rows[0] : null;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 });
  }

  const isValid = await verifyHash(password, user.password);

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401 });
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name
  });

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: {
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; SameSite=Strict; Secure`,
      'Content-Type': 'application/json'
    }
  });
};