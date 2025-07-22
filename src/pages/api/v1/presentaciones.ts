import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const body = await request.json();
        const nombre = (body.nombre || "").trim();

        if (!nombre || nombre.length < 2 || nombre.length > 32) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "El nombre es obligatorio y debe tener entre 2 y 32 caracteres." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existe = await db.get("SELECT id FROM presentaciones WHERE nombre = ?", nombre);
        if (existe) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "Ya existe una presentación con ese nombre." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.run("INSERT INTO presentaciones (nombre) VALUES (?)", nombre);
        await db.close();
        return new Response(
            JSON.stringify({ message: "Presentación agregada correctamente." }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        await db.close();
        return new Response(
            JSON.stringify({ error: "Error al agregar la presentación." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

export const PUT: APIRoute = async ({ request }) => {
    const db = await getDb();
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const body = await request.json();
        const nombre = (body.nombre || "").trim();

        if (!id) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "ID de presentación requerido." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!nombre || nombre.length < 2 || nombre.length > 32) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "El nombre es obligatorio y debe tener entre 2 y 32 caracteres." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existe = await db.get("SELECT id FROM presentaciones WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "No existe una presentación con ese ID." }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const duplicado = await db.get(
            "SELECT id FROM presentaciones WHERE nombre = ? AND id != ?",
            nombre,
            id
        );
        if (duplicado) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "Ya existe una presentación con ese nombre." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.run("UPDATE presentaciones SET nombre = ? WHERE id = ?", nombre, id);
        await db.close();
        return new Response(
            JSON.stringify({ message: "Presentación actualizada correctamente." }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        await db.close();
        return new Response(
            JSON.stringify({ error: "Error al actualizar la presentación." }),
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
                JSON.stringify({ error: "ID de presentación requerido." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const enUso = await db.get(
            "SELECT 1 FROM medicamentos WHERE presentacion_id = ? LIMIT 1",
            id
        );
        if (enUso) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "No se puede eliminar la presentación porque está asociada a un medicamento. Elimine primero los medicamentos correspondientes." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        const existe = await db.get("SELECT id FROM presentaciones WHERE id = ?", id);
        if (!existe) {
            await db.close();
            return new Response(
                JSON.stringify({ error: "No existe una presentación con ese ID." }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        await db.run("DELETE FROM presentaciones WHERE id = ?", id);
        await db.close();
        return new Response(
            JSON.stringify({ message: "Presentación eliminada correctamente." }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        await db.close();
        return new Response(
            JSON.stringify({ error: "Error al eliminar la presentación." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};