import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const medicamentos = await db.all("SELECT id, nombre FROM medicamentos ORDER BY nombre ASC");
    await db.close();
    return new Response(JSON.stringify(medicamentos), { status: 200 });
};