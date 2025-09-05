import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Set-Cookie': 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure',
      'Content-Type': 'application/json'
    }
  });
};