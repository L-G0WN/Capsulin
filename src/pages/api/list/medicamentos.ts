import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    const sintomaId = url.searchParams.get("sintomaId");
    let medicamentos;
    if (sintomaId) {
        medicamentos = await db.execute(`
            SELECT m.id, m.nombre, m.activo
            FROM medicamentos m
            WHERE m.id NOT IN (
                SELECT medicamento_id FROM sintoma_medicamento WHERE sintoma_id = ?
            )
            ORDER BY m.nombre ASC
        `, sintomaId);
    } else {
        medicamentos = await db.execute(`
            SELECT m.id, m.nombre, m.activo
            FROM medicamentos m
            ORDER BY m.nombre ASC
        `);
    }
    return new Response(JSON.stringify(medicamentos), { status: 200 });
};