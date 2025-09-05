import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const sintomas = await db.execute(`
            SELECT s.id, s.nombre
            FROM sintomas s
            ORDER BY s.nombre ASC
        `);
    return new Response(JSON.stringify(sintomas), { status: 200 });
};