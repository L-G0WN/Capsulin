import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const sintomas = await db.all("SELECT id, titulo FROM sintomas ORDER BY titulo ASC");
    await db.close();
    return new Response(JSON.stringify(sintomas), { status: 200 });
};