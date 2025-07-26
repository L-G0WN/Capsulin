import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    if (!data.nombre || typeof data.nombre !== "string" || data.nombre.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }
    if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 5 caracteres." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.get(
            "SELECT id FROM sintomas WHERE nombre = ?",
            data.nombre.trim()
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese nombre." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO sintomas (nombre, descripcion)
             VALUES (?, ?)`,
            [
                data.nombre.trim(),
                data.descripcion.trim(),
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

        if (!id) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "ID de síntoma requerido." }),
                { status: 400 }
            );
        }
        if (!data.nombre || typeof data.nombre !== "string" || data.nombre.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.descripcion || typeof data.descripcion !== "string" || data.descripcion.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 5 caracteres." }),
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
            "SELECT id FROM sintomas WHERE nombre = ? AND id != ?",
            data.nombre.trim(),
            id
        );
        if (duplicado) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese nombre." }),
                { status: 409 }
            );
        }

        await db.run(
            `UPDATE sintomas
             SET nombre = ?, descripcion = ?
             WHERE id = ?`,
            [
                data.nombre.trim(),
                data.descripcion.trim(),
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