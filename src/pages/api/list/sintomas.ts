import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    // Parametro: ?noRelacionados=true, traer solo los síntomas no relacionados
    const noRelacionados = url.searchParams.get("noRelacionados") === "true";
    let sintomas;
    if (noRelacionados) {
        sintomas = await db.all(`
            SELECT s.id, s.titulo
            FROM sintomas s
            LEFT JOIN sintoma_medicamento sm ON sm.sintoma_id = s.id
            WHERE sm.sintoma_id IS NULL
            ORDER BY s.titulo ASC
        `);
    } else {
        sintomas = await db.all("SELECT id, titulo FROM sintomas ORDER BY titulo ASC");
    }
    await db.close();
    return new Response(JSON.stringify(sintomas), { status: 200 });
};