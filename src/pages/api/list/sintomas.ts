import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const sintomas = await db.all(`
            SELECT s.id, s.nombre
            FROM sintomas s
            ORDER BY s.nombre ASC
        `);
    await db.close();
    return new Response(JSON.stringify(sintomas), { status: 200 });
};