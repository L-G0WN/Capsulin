import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    if (!data.medicamento_nombre || typeof data.medicamento_nombre !== "string" || data.medicamento_nombre.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }
    if (!data.medicamento_activo || typeof data.medicamento_activo !== "string" || data.medicamento_activo.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Activo es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }
    if (!data.medicamento_efectos || typeof data.medicamento_efectos !== "string" || data.medicamento_efectos.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Efectos es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }
    if (!data.medicamento_categorias || typeof data.medicamento_categorias !== "string" || data.medicamento_categorias.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Categorias es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.get(
            "SELECT id FROM medicamentos WHERE nombre = ? AND activo = ?",
            data.medicamento_nombre.trim(),
            data.medicamento_activo.trim()
        );
        if (existe) {
            await db.close();
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y activo." }), { status: 409 });
        }

        await db.run(
            `INSERT INTO medicamentos (nombre, activo, efectos, categorias)
             VALUES (?, ?, ?, ?)`,
            [
                data.medicamento_nombre.trim(),
                data.medicamento_activo.trim(),
                data.medicamento_efectos.trim(),
                data.medicamento_categorias.trim()
            ]
        );
        await db.close();
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        await db.close();
        return new Response(JSON.stringify({ ok: false, error: "Error al insertar medicamento." }), { status: 400 });
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
                JSON.stringify({ ok: false, error: "ID de medicamento requerido." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_nombre || typeof data.medicamento_nombre !== "string" || data.medicamento_nombre.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_activo || typeof data.medicamento_activo !== "string" || data.medicamento_activo.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Activo es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_efectos || typeof data.medicamento_efectos !== "string" || data.medicamento_efectos.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Efectos es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_categorias || typeof data.medicamento_categorias !== "string" || data.medicamento_categorias.trim().length < 5) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Categorias es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
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

        const duplicado = await db.get("SELECT id FROM medicamentos WHERE nombre = ? AND activo = ? AND id != ?",
            data.medicamento_nombre.trim(),
            data.medicamento_activo.trim(),
            id
        );
        if (duplicado) {
            await db.close();
            return new Response(
                JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y activo." }),
                { status: 409 }
            );
        }

        await db.run(`UPDATE medicamentos SET nombre = ?, activo = ?, efectos = ?, categorias = ? WHERE id = ?`,
            [
                data.medicamento_nombre.trim(),
                data.medicamento_activo.trim(),
                data.medicamento_efectos.trim(),
                data.medicamento_categorias.trim(),
                id
            ]
        );
        await db.close();
        return new Response(
            JSON.stringify({ ok: true, message: "Medicamento actualizado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        await db.close();
        return new Response(
            JSON.stringify({ ok: false, error: "Error al actualizar medicamento." }),
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