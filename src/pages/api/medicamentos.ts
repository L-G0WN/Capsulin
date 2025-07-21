import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    // Validaciones
    if (!data.nombre || typeof data.nombre !== "string" || data.nombre.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.efectos || typeof data.efectos !== "string" || data.efectos.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Efectos es requerido y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (!data.presentacion || typeof data.presentacion !== "string" || data.presentacion.trim().length < 2) {
        return new Response(JSON.stringify({ ok: false, error: "Presentación es requerida y debe tener al menos 2 caracteres." }), { status: 400 });
    }
    if (data.contraindicaciones && typeof data.contraindicaciones !== "string") {
        return new Response(JSON.stringify({ ok: false, error: "Contraindicaciones debe ser texto." }), { status: 400 });
    }

    const db = await getDb();
    try {
        // Verificar si ya existe el medicamento con ese nombre y presentación
        const existe = await db.get(
            "SELECT id FROM medicamentos WHERE nombre = ? AND presentacion = ?",
            data.nombre.trim(),
            data.presentacion.trim()
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y presentación." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO medicamentos (nombre, efectos, presentacion, contraindicaciones)
             VALUES (?, ?, ?, ?)`,
            [
                data.nombre.trim(),
                data.efectos.trim(),
                data.presentacion.trim(),
                data.contraindicaciones ? data.contraindicaciones.trim() : null
            ]
        );
        await db.close();
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        await db.close();
        return new Response(JSON.stringify({ ok: false, error: "Error al insertar medicamento." }), { status: 400 });
    }
};