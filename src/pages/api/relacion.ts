import { getDb } from "@/lib/db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    // Validaciones
    if (!data.sintoma_id || isNaN(Number(data.sintoma_id))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de síntoma inválido." }), { status: 400 });
    }
    if (!data.medicamento_id || isNaN(Number(data.medicamento_id))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de medicamento inválido." }), { status: 400 });
    }
    if (!data.dosis || typeof data.dosis !== "string" || data.dosis.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Dosis es requerida y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.intensidad || typeof data.intensidad !== "string" || !["Normal", "Medio", "Muy Fuerte"].includes(data.intensidad)) {
        return new Response(JSON.stringify({ ok: false, error: "Intensidad inválida." }), { status: 400 });
    }
    if (!data.duracion || typeof data.duracion !== "string" || data.duracion.trim().length < 1) {
        return new Response(JSON.stringify({ ok: false, error: "Duración es requerida y debe ser texto." }), { status: 400 });
    }

    const db = await getDb();
    try {
        // Verificar si ya existe la relación exacta
        const existe = await db.get(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND dosis = ? AND intensidad = ?`,
            Number(data.sintoma_id),
            Number(data.medicamento_id),
            data.dosis.trim(),
            data.intensidad
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe esta relación para ese síntoma, medicamento, dosis e intensidad." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO sintoma_medicamento (sintoma_id, medicamento_id, dosis, duracion, intensidad)
             VALUES (?, ?, ?, ?, ?)`,
            [
                Number(data.sintoma_id),
                Number(data.medicamento_id),
                data.dosis.trim(),
                data.duracion ? data.duracion.trim() : null,
                data.intensidad
            ]
        );
        await db.close();
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        await db.close();
        return new Response(JSON.stringify({ ok: false, error: "Error al crear la relación." }), { status: 400 });
    }
};