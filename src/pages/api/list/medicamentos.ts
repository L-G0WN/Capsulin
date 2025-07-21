import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const db = await getDb();
    const medicamentos = await db.all(`
        SELECT m.id, m.nombre
        FROM medicamentos m
        LEFT JOIN sintoma_medicamento sm ON sm.medicamento_id = m.id
        WHERE sm.medicamento_id IS NULL
        ORDER BY m.nombre ASC
    `);
    await db.close();
    return new Response(JSON.stringify(medicamentos), { status: 200 });
};