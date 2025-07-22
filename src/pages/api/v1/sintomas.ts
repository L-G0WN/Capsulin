import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    if (!data.titulo || typeof data.titulo !== "string" || data.titulo.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Título es requerido y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.recomendacion || typeof data.recomendacion !== "string" || data.recomendacion.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Recomendación es requerida y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.emergencia || typeof data.emergencia !== "string" || data.emergencia.trim().length < 1) {
        return new Response(JSON.stringify({ ok: false, error: "Emergencia es requerida." }), { status: 400 });
    }
    if (data.categoria && typeof data.categoria !== "string") {
        return new Response(JSON.stringify({ ok: false, error: "Categoría debe ser texto." }), { status: 400 });
    }
    if (data.frecuencia && typeof data.frecuencia !== "string") {
        return new Response(JSON.stringify({ ok: false, error: "Frecuencia debe ser texto." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.get(
            "SELECT id FROM sintomas WHERE titulo = ?",
            data.titulo.trim()
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese título." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO sintomas (titulo, descripcion, recomendacion, emergencia, categoria, frecuencia)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.titulo.trim(),
                data.descripcion.trim(),
                data.recomendacion.trim(),
                data.emergencia.trim(),
                data.categoria ? data.categoria.trim() : null,
                data.frecuencia ? data.frecuencia.trim() : null,
            ]
        );
        await db.close();
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        await db.close();
        return new Response(JSON.stringify({ ok: false, error: "Error al insertar síntoma." }), { status: 400 });
    }
};

export const PUT: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const data = await request.json();

        // Validaciones
        if (!id) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "ID de síntoma requerido." }),
                { status: 400 }
            );
        }
        if (!data.titulo || typeof data.titulo !== "string" || data.titulo.trim().length < 2) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Título es requerido y debe tener al menos 2 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.trim().length < 2) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 2 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.recomendacion || typeof data.recomendacion !== "string" || data.recomendacion.trim().length < 2) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Recomendación es requerida y debe tener al menos 2 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.emergencia || typeof data.emergencia !== "string" || data.emergencia.trim().length < 1) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Emergencia es requerida." }),
                { status: 400 }
            );
        }
        if (data.categoria && typeof data.categoria !== "string") {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Categoría debe ser texto." }),
                { status: 400 }
            );
        }
        if (data.frecuencia && typeof data.frecuencia !== "string") {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Frecuencia debe ser texto." }),
                { status: 400 }
            );
        }

        const existe = await db.get("SELECT id FROM sintomas WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un síntoma con ese ID." }),
                { status: 404 }
            );
        }

        const duplicado = await db.get(
            "SELECT id FROM sintomas WHERE titulo = ? AND id != ?",
            data.titulo.trim(),
            id
        );
        if (duplicado) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese título." }),
                { status: 409 }
            );
        }

        await db.run(
            `UPDATE sintomas
             SET titulo = ?, descripcion = ?, recomendacion = ?, emergencia = ?, categoria = ?, frecuencia = ?
             WHERE id = ?`,
            [
                data.titulo.trim(),
                data.descripcion.trim(),
                data.recomendacion.trim(),
                data.emergencia.trim(),
                data.categoria ? data.categoria.trim() : null,
                data.frecuencia ? data.frecuencia.trim() : null,
                id
            ]
        );
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Síntoma actualizado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al actualizar síntoma." }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "ID de síntoma requerido." }),
                { status: 400 }
            );
        }

        const enUso = await db.get(
            "SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No se puede eliminar el síntoma porque está asociado a una relación. Elimine primero las relaciones correspondientes." }),
                { status: 409 }
            );
        }

        const existe = await db.get("SELECT id FROM sintomas WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un síntoma con ese ID." }),
                { status: 404 }
            );
        }

        await db.run("DELETE FROM sintomas WHERE id = ?", id);
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Síntoma eliminado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar el síntoma." }),
            { status: 500 }
        );
    }
};