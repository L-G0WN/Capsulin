import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

// Función para normalizar (quitar acentos y pasar a minúsculas)
function normalizar(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export const GET: APIRoute = async ({ url }) => {
    let query = url.searchParams.get('query') || '';
    const db = getDb();

    try {
        // Detectar intensidades en el query (puede ser una o varias)
        let intensidades: string[] = [];
        const queryNorm = normalizar(query);
        if (queryNorm.includes("muy fuerte")) intensidades.push("Muy Fuerte");
        if (queryNorm.includes("media")) intensidades.push("Media");
        if (queryNorm.includes("normal")) intensidades.push("Normal");

        // Extraer palabras clave del query (ignorando palabras muy cortas)
        const palabrasClave = queryNorm
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length > 2);

        // Obtener todos los síntomas y medicamentos (puedes limitar si tienes muchos)
        let [sintomas] = await db.execute(
            `SELECT id, nombre, descripcion FROM sintomas`
        );
        let [medicamentos] = await db.execute(
            `SELECT id, nombre, activo, efectos, categorias FROM medicamentos`
        );

        // Filtrar coincidencia insensible a acentos
        if (palabrasClave.length > 0) {
            sintomas = sintomas.filter((s: any) =>
                palabrasClave.some(palabra =>
                    normalizar(s.nombre).includes(palabra)
                )
            );
            medicamentos = medicamentos.filter((m: any) =>
                palabrasClave.some(palabra =>
                    normalizar(m.nombre).includes(palabra) ||
                    (m.activo && normalizar(m.activo).includes(palabra))
                )
            );
        }

        // Relacionar medicamentos con síntomas y filtrar por intensidad si corresponde
        for (const sintoma of sintomas) {
            let rels: any[] = [];
            if (intensidades.length > 0) {
                const placeholders = intensidades.map(() => `sm.intensidad LIKE ?`).join(" OR ");
                const params = intensidades.map(i => `%${i}%`);
                const [relsRows] = await db.execute(`
                    SELECT m.id, m.nombre, m.activo, m.efectos, m.categorias, sm.intensidad
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    WHERE sm.sintoma_id = ? AND (${placeholders})
                `, [sintoma.id, ...params]);
                rels = relsRows;
                if (!rels || rels.length === 0) {
                    const [normalRels] = await db.execute(`
                        SELECT m.id, m.nombre, m.activo, m.efectos, m.categorias, sm.intensidad
                        FROM sintoma_medicamento sm
                        JOIN medicamentos m ON sm.medicamento_id = m.id
                        WHERE sm.sintoma_id = ? AND sm.intensidad LIKE ?
                    `, [sintoma.id, '%Normal%']);
                    sintoma.medicamentos = normalRels ?? [];
                    sintoma.sinMedicamentosPorIntensidad = true;
                    continue;
                }
            } else {
                const [relsRows] = await db.execute(`
                    SELECT m.id, m.nombre, m.activo, m.efectos, m.categorias, sm.intensidad
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    WHERE sm.sintoma_id = ?
                `, [sintoma.id]);
                rels = relsRows;
            }
            sintoma.medicamentos = rels ?? [];
        }

        // Para medicamentos directos, mostrar los síntomas que trata y las intensidades
        for (const medicamento of medicamentos) {
            const [rows] = await db.execute(
                `SELECT s.nombre, sm.intensidad
                FROM sintoma_medicamento sm
                JOIN sintomas s ON sm.sintoma_id = s.id
                WHERE sm.medicamento_id = ?`,
                [medicamento.id]
            );
            medicamento.sintomas = rows.map((s: any) => `${s.nombre} (${s.intensidad})`);
        }

        return new Response(JSON.stringify({
            sintomas: sintomas ?? [],
            medicamentos: medicamentos ?? []
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            sintomas: [],
            medicamentos: [],
            error: "Error al buscar en la base de datos"
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};