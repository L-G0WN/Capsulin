import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const dosis = await db.all(`SELECT id, cantidad FROM dosis ORDER BY cantidad ASC`);
    await db.close();
    return new Response(JSON.stringify(dosis), { status: 200 });
};