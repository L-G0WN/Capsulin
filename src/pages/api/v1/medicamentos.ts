import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

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
        const existe = await db.execute(
            "SELECT id FROM medicamentos WHERE nombre = ? AND activo = ?",
            [data.medicamento_nombre.trim(), data.medicamento_activo.trim()]
        );
        if (existe) {
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y activo." }), { status: 409 });
        }

        await db.execute(
            `INSERT INTO medicamentos (nombre, activo, efectos, categorias)
             VALUES (?, ?, ?, ?)`,
            [
                data.medicamento_nombre.trim(),
                data.medicamento_activo.trim(),
                data.medicamento_efectos.trim(),
                data.medicamento_categorias.trim()
            ]
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: "Error al insertar medicamento." }), { status: 400 });
    }
};

/* export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    const pagina = Number(url.searchParams.get("pagina") || 1);
    const PAGE_SIZE = 5;
    const medTotal = await db.execute("SELECT COUNT(*) as c FROM medicamentos");
    const medOffset = (pagina - 1) * PAGE_SIZE;
    const medicamentos = await db.execute(
        `SELECT id, nombre, activo, efectos, categorias FROM medicamentos ORDER BY nombre ASC LIMIT ? OFFSET ?`,
        [PAGE_SIZE, medOffset]
    );
    return new Response(JSON.stringify({ medicamentos, medTotal, PAGE_SIZE }), {
        headers: { "Content-Type": "application/json" }
    });
}; */

export const PUT: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const data = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ ok: false, error: "ID de medicamento requerido." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_nombre || typeof data.medicamento_nombre !== "string" || data.medicamento_nombre.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_activo || typeof data.medicamento_activo !== "string" || data.medicamento_activo.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Activo es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_efectos || typeof data.medicamento_efectos !== "string" || data.medicamento_efectos.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Efectos es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.medicamento_categorias || typeof data.medicamento_categorias !== "string" || data.medicamento_categorias.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Categorias es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }

        const existe = await db.execute("SELECT id FROM medicamentos WHERE id = ?", id);
        if (!existe) {
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un medicamento con ese ID." }),
                { status: 404 }
            );
        }

        const duplicado = await db.execute("SELECT id FROM medicamentos WHERE nombre = ? AND activo = ? AND id != ?",
            [data.medicamento_nombre.trim(), data.medicamento_activo.trim(), id]
        );
        if (duplicado) {
            return new Response(
                JSON.stringify({ ok: false, error: "Ya existe un medicamento con ese nombre y activo." }),
                { status: 409 }
            );
        }

        await db.execute(`UPDATE medicamentos SET nombre = ?, activo = ?, efectos = ?, categorias = ? WHERE id = ?`,
            [
                data.medicamento_nombre.trim(),
                data.medicamento_activo.trim(),
                data.medicamento_efectos.trim(),
                data.medicamento_categorias.trim(),
                id
            ]
        );
        return new Response(
            JSON.stringify({ ok: true, message: "Medicamento actualizado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
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
            return new Response(
                JSON.stringify({ ok: false, error: "ID de medicamento requerido." }),
                { status: 400 }
            );
        }

        const enUso = await db.execute(
            "SELECT 1 FROM sintoma_medicamento WHERE medicamento_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            return new Response(
                JSON.stringify({ ok: false, error: "No se puede eliminar el medicamento porque está asociado a una relación. Elimine primero las relaciones correspondientes." }),
                { status: 409 }
            );
        }

        const existe = await db.execute("SELECT id FROM medicamentos WHERE id = ?", id);
        if (!existe) {
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un medicamento con ese ID." }),
                { status: 404 }
            );
        }

        await db.execute("DELETE FROM medicamentos WHERE id = ?", id);
        return new Response(
            JSON.stringify({ ok: true, message: "Medicamento eliminado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar el medicamento." }),
            { status: 500 }
        );
    }
};