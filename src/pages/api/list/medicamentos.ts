import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    const sintomaId = url.searchParams.get("sintomaId");
    let medicamentos;
    if (sintomaId) {
        medicamentos = await db.all(`
            SELECT m.id, m.nombre, m.activo
            FROM medicamentos m
            WHERE m.id NOT IN (
                SELECT medicamento_id FROM sintoma_medicamento WHERE sintoma_id = ?
            )
            ORDER BY m.nombre ASC
        `, sintomaId);
    } else {
        medicamentos = await db.all(`
            SELECT m.id, m.nombre, m.activo
            FROM medicamentos m
            ORDER BY m.nombre ASC
        `);
    }
    await db.close();
    return new Response(JSON.stringify(medicamentos), { status: 200 });
};