import { getDb } from "@/lib/db";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    if (!data.sintoma_id || isNaN(Number(data.sintoma_id))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de síntoma inválido." }), { status: 400 });
    }
    if (!data.medicamento_id || isNaN(Number(data.medicamento_id))) {
        return new Response(JSON.stringify({ ok: false, error: "ID de medicamento inválido." }), { status: 400 });
    }
    if (!data.intensidad || typeof data.intensidad !== "string" || !["Normal", "Medio", "Muy Fuerte"].includes(data.intensidad)) {
        return new Response(JSON.stringify({ ok: false, error: "Intensidad inválida." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.get(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            Number(data.sintoma_id),
            Number(data.medicamento_id),
            data.intensidad
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe esta relación para ese síntoma, medicamento e intensidad." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO sintoma_medicamento (sintoma_id, medicamento_id, intensidad)
             VALUES (?, ?, ?)`,
            [
                Number(data.sintoma_id),
                Number(data.medicamento_id),
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

export const PUT: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const sintoma_id = url.searchParams.get("sintoma_id");
        const medicamento_id = url.searchParams.get("medicamento_id");
        const intensidad = url.searchParams.get("intensidad");
        const data = await request.json();

        if (!sintoma_id || isNaN(Number(sintoma_id))) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "ID de síntoma inválido." }), { status: 400 });
        }
        if (!medicamento_id || isNaN(Number(medicamento_id))) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "ID de medicamento inválido." }), { status: 400 });
        }
        if (!intensidad || typeof intensidad !== "string" || !["Normal", "Medio", "Muy Fuerte"].includes(intensidad)) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Intensidad inválida." }), { status: 400 });
        }

        if (!data.intensidad || typeof data.intensidad !== "string" || !["Normal", "Medio", "Muy Fuerte"].includes(data.intensidad)) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Nueva intensidad inválida." }), { status: 400 });
        }

        const existe = await db.get(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            Number(sintoma_id),
            Number(medicamento_id),
            intensidad
        );
        if (!existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "No existe esa relación." }), { status: 404 });
        }

        const duplicado = await db.get(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ? AND NOT intensidad = ?`,
            Number(sintoma_id),
            Number(medicamento_id),
            data.intensidad,
            intensidad
        );
        if (duplicado) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe una relación con esos valores." }), { status: 409 });
        }

        await db.run(
            `UPDATE sintoma_medicamento
             SET intensidad = ?
             WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            data.intensidad,
            Number(sintoma_id),
            Number(medicamento_id),
            intensidad
        );
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Relación actualizada correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al actualizar la relación." }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const sintoma_id = url.searchParams.get("sintoma_id");
        const medicamento_id = url.searchParams.get("medicamento_id");
        const intensidad = url.searchParams.get("intensidad");

        if (!sintoma_id || !medicamento_id || !intensidad) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Faltan parámetros para eliminar la relación." }),
                { status: 400 }
            );
        }

        const existe = await db.get(
            `SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            Number(sintoma_id),
            Number(medicamento_id),
            intensidad
        );
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No existe esa relación." }),
                { status: 404 }
            );
        }

        await db.run(
            `DELETE FROM sintoma_medicamento WHERE sintoma_id = ? AND medicamento_id = ? AND intensidad = ?`,
            Number(sintoma_id),
            Number(medicamento_id),
            intensidad
        );
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Relación eliminada correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar la relación." }),
            { status: 500 }
        );
    }
};