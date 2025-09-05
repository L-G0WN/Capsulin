import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();

    if (!data.sintoma_nombre || typeof data.sintoma_nombre !== "string" || data.sintoma_nombre.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }), { status: 400 });
    }
    if (!data.sintoma_descripcion || typeof data.sintoma_descripcion !== "string" || data.sintoma_descripcion.trim().length < 5) {
        return new Response(JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 5 caracteres." }), { status: 400 });
    }

    const db = await getDb();
    try {
        const existe = await db.execute(
            "SELECT id FROM sintomas WHERE nombre = ?",
            data.sintoma_nombre.trim()
        );
        if (existe) {
            return new Response(JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese nombre." }), { status: 409 });
        }

        await db.execute(
            `INSERT INTO sintomas (nombre, descripcion)
             VALUES (?, ?)`,
            [
                data.sintoma_nombre.trim(),
                data.sintoma_descripcion.trim(),
            ]
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: "Error al insertar síntoma." }), { status: 400 });
    }
};

export const GET: APIRoute = async ({ url }) => {
    const db = await getDb();
    const pagina = Number(url.searchParams.get("pagina") || 1);
    const PAGE_SIZE = 5;
    const sintTotal = await db.execute("SELECT COUNT(*) as c FROM sintomas");
    const sintOffset = (pagina - 1) * PAGE_SIZE;
    const sintomas = await db.execute(
        `SELECT id, nombre, descripcion FROM sintomas ORDER BY nombre ASC LIMIT ? OFFSET ?`,
        [PAGE_SIZE, sintOffset]
    );
    return new Response(JSON.stringify({ sintomas, sintTotal, PAGE_SIZE }), {
        headers: { "Content-Type": "application/json" }
    });
}; 

export const PUT: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const data = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ ok: false, error: "ID de síntoma requerido." }),
                { status: 400 }
            );
        }
        if (!data.sintoma_nombre || typeof data.sintoma_nombre !== "string" || data.sintoma_nombre.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Nombre es requerido y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }
        if (!data.sintoma_descripcion || typeof data.sintoma_descripcion !== "string" || data.sintoma_descripcion.trim().length < 5) {
            return new Response(
                JSON.stringify({ ok: false, error: "Descripción es requerida y debe tener al menos 5 caracteres." }),
                { status: 400 }
            );
        }

        const existe = await db.execute("SELECT id FROM sintomas WHERE id = ?", id);
        if (!existe) {
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un síntoma con ese ID." }),
                { status: 404 }
            );
        }

        const duplicado = await db.execute(
            "SELECT id FROM sintomas WHERE nombre = ? AND id != ?",
            [data.sintoma_nombre.trim(), id]
        );
        if (duplicado) {
            return new Response(
                JSON.stringify({ ok: false, error: "Ya existe un síntoma con ese nombre." }),
                { status: 409 }
            );
        }

        await db.execute(
            `UPDATE sintomas
             SET nombre = ?, descripcion = ?
             WHERE id = ?`,
            [
                data.sintoma_nombre.trim(),
                data.sintoma_descripcion.trim(),
                id
            ]
        );
        return new Response(
            JSON.stringify({ ok: true, message: "Síntoma actualizado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
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
            return new Response(
                JSON.stringify({ ok: false, error: "ID de síntoma requerido." }),
                { status: 400 }
            );
        }

        const enUso = await db.execute(
            "SELECT 1 FROM sintoma_medicamento WHERE sintoma_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            return new Response(
                JSON.stringify({ ok: false, error: "No se puede eliminar el síntoma porque está asociado a una relación. Elimine primero las relaciones correspondientes." }),
                { status: 409 }
            );
        }

        const existe = await db.execute("SELECT id FROM sintomas WHERE id = ?", id);
        if (!existe) {
            return new Response(
                JSON.stringify({ ok: false, error: "No existe un síntoma con ese ID." }),
                { status: 404 }
            );
        }

        await db.execute("DELETE FROM sintomas WHERE id = ?", id);
        return new Response(
            JSON.stringify({ ok: true, message: "Síntoma eliminado correctamente." }),
            { status: 200 }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ ok: false, error: "Error al eliminar el síntoma." }),
            { status: 500 }
        );
    }
};