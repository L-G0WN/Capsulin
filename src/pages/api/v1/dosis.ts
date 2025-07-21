import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const body = await request.json();
        const cantidad = (body.cantidad || "").trim();

        if (!cantidad || cantidad.length < 2 || cantidad.length > 32) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "La cantidad es obligatoria y debe tener entre 2 y 32 caracteres." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existe = await db.get("SELECT id FROM dosis WHERE cantidad = ?", cantidad);
        if (existe) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "Ya existe una dosis con esa cantidad." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.run("INSERT INTO dosis (cantidad) VALUES (?)", cantidad);
        await db.close();
        return new Response(
            JSON.stringify({ message: "Dosis agregada correctamente." }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        await db.close();
        return new Response(
            JSON.stringify({ error: "Error al agregar la dosis." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
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
                JSON.stringify({ error: "ID de dosis requerido." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const enUso = await db.get(
            "SELECT 1 FROM sintoma_medicamento WHERE dosis_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "No se puede eliminar la dosis porque está asociada a una relación. Elimine primero las relaciones correspondientes." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        const existe = await db.get("SELECT id FROM dosis WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "No existe una dosis con ese ID." }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.run("DELETE FROM dosis WHERE id = ?", id);
        await db.close();
        return new Response(
            JSON.stringify({ message: "Dosis eliminada correctamente." }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        await db.close();
        return new Response(
            JSON.stringify({ error: "Error al eliminar la dosis." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};