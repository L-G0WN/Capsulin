import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();
    console.log(data.relacion_sintoma);
    console.log(data.relacion_medicamento);
    console.log(data.relacion_intensidad);
    if (!data.relacion_sintoma || isNaN(Number(data.relacion_sintoma))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de síntoma inválido." }), { status: 400 });
    }
    if (!data.relacion_medicamento || isNaN(Number(data.relacion_medicamento))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de medicamento inválido." }), { status: 400 });
    }
    if (
        !Array.isArray(data.relacion_intensidad) ||
        data.relacion_intensidad.length === 0 ||
        !data.relacion_intensidad.every(
            (intensidad: string) => ["Normal", "Media", "Muy Fuerte"].includes(intensidad)
        )
    ) {
        return new Response(JSON.stringify({ ok: false, error: "Intensidad inválida." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.execute(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            [Number(data.relacion_sintoma), Number(data.relacion_medicamento), data.relacion_intensidad.join(", ")]
        );
        if (existe) {
            return new Response(JSON.stringify({ ok: false, error: "Ya existe esta relación para ese síntoma, medicamento e intensidad." }), { status: 409 });
        }

        await db.execute(
            `INSERT INTO sintoma_medicamento (sintoma_id, medicamento_id, intensidad)
             VALUES (?, ?, ?)`,
            [
                Number(data.relacion_sintoma),
                Number(data.relacion_medicamento),
                data.relacion_intensidad.join(", ")
            ]
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: "Error al crear la relación." }), { status: 400 });
    }
};

/* export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    const pagina = Number(url.searchParams.get("pagina") || 1);
    const PAGE_SIZE = 5;
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();

    // Construir filtro de búsqueda
    let where = "";
    let params: any[] = [];
    if (search) {
        where = `
            WHERE 
                LOWER(s.nombre) LIKE ? OR
                LOWER(m.nombre) LIKE ? OR
                LOWER(sm.intensidad) LIKE ?
        `;
        params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    // Total de relaciones (para paginación)
    const rels = await db.execute(
        `SELECT COUNT(*) as c
         FROM sintoma_medicamento sm
         JOIN sintomas s ON sm.sintoma_id = s.id
         JOIN medicamentos m ON sm.medicamento_id = m.id
         ${where}`,
        [...params]
    );
    const relTotal = rels || 0;

    // Obtener relaciones paginadas
    const offset = (pagina - 1) * PAGE_SIZE;
    const relaciones = await db.execute(
        `SELECT sm.sintoma_id, s.nombre as sintoma, sm.medicamento_id, m.nombre as medicamento, sm.intensidad
         FROM sintoma_medicamento sm
         JOIN sintomas s ON sm.sintoma_id = s.id
         JOIN medicamentos m ON sm.medicamento_id = m.id
         ${where}
         ORDER BY s.nombre ASC, m.nombre ASC
         LIMIT ? OFFSET ?`,
        [...params, PAGE_SIZE, offset]
    );

    return new Response(JSON.stringify({ relaciones, relTotal, PAGE_SIZE }), {
        headers: { "Content-Type": "application/json" }
    });
}; */

export const DELETE: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const sintoma_id = url.searchParams.get("relacion_sintoma");
        const medicamento_id = url.searchParams.get("relacion_medicamento");
        const intensidad = url.searchParams.get("relacion_intensidad");

        if (!sintoma_id || !medicamento_id || !intensidad) {
            return new Response(
                JSON.stringify({ ok: false, error: "Faltan parámetros para eliminar la relación." }),
                { status: 400 }
            );
        }

        const existe = await db.execute(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            [Number(sintoma_id), Number(medicamento_id), intensidad]
        );
        if (!existe) {
            return new Response(
                JSON.stringify({ ok: false, error: "No existe esa relación." }),
                { status: 404 }
            );
        }

        await db.execute(
            `DELETE FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            [Number(sintoma_id), Number(medicamento_id), intensidad]
        );
        return new Response(
            JSON.stringify({ ok: true, message: "Relación eliminada correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar la relación." }),
            { status: 500 }
        );
    }
};