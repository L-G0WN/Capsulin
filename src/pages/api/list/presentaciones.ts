import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const presentaciones = await db.all(`SELECT id, nombre FROM presentaciones ORDER BY nombre ASC`);
    await db.close();
    return new Response(JSON.stringify(presentaciones), { status: 200 });
};