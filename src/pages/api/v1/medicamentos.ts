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
    if (data.contraindicaciones && typeof data.contraindicaciones !== "string") {
        return new Response(JSON.stringify({ ok: false, error: "Contraindicaciones debe ser texto." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.get(
            "SELECT id FROM medicamentos WHERE nombre = ? AND presentacion_id = ?",
            data.nombre.trim(),
            data.presentacion_id.trim()
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y presentación." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO medicamentos (nombre, efectos, presentacion_id, contraindicaciones)
             VALUES (?, ?, ?, ?)`,
            [
                data.nombre.trim(),
                data.efectos.trim(),
                data.presentacion_id.trim(),
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

export const DELETE: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "ID de medicamento requerido." }),
                { status: 400 }
            );
        }

        const enUso = await db.get(
            "SELECT 1 FROM sintoma_medicamento WHERE medicamento_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No se puede eliminar el medicamento porque está asociado a una relación. Elimine primero las relaciones correspondientes." }),
                { status: 409 }
            );
        }

        const existe = await db.get("SELECT id FROM medicamentos WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un medicamento con ese ID." }),
                { status: 404 }
            );
        }

        await db.run("DELETE FROM medicamentos WHERE id = ?", id);
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Medicamento eliminado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar el medicamento." }),
            { status: 500 }
        );
    }
};