import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";
import type { Sintoma } from "@/types.ts";
import { cleanQuery } from "@/utils/cleanQuery.ts"; 

export const GET: APIRoute = async ({ request, url }) => {
    const searchParams = new URL(url).searchParams;
    const query = searchParams.get('query')?.toLowerCase() || '';
    
    const cleanedQuery = cleanQuery(query); // Limpia la consulta

    const db = await getDb();
    
    try {
        const results: any[] = await db.all(
            `SELECT s.titulo AS sintoma, s.descripcion, s.recomendacion, s.emergencia,
                    m.nombre AS medicamento, m.dosis, m.efectos
            FROM sintomas s
            LEFT JOIN sintoma_medicamento sm ON s.id = sm.sintoma_id
            LEFT JOIN medicamentos m ON sm.medicamento_id = m.id
            WHERE LOWER(s.titulo) LIKE ? OR LOWER(s.descripcion) LIKE ? OR LOWER(m.nombre) LIKE ?
            ORDER BY s.titulo`,
            [`%${cleanedQuery}%`, `%${cleanedQuery}%`, `%${cleanedQuery}%`]
        );

        await db.close();
        
        // Agrupar resultados por síntoma
        const groupedResults: Record<string, Sintoma> = {};
        results.forEach(row => {
            if (!groupedResults[row.sintoma]) {
                groupedResults[row.sintoma] = {
                    sintoma: row.sintoma,
                    descripcion: row.descripcion,
                    recomendacion: row.recomendacion,
                    emergencia: row.emergencia,
                    medicamentos: []
                };
            }
            if (row.medicamento) {
                groupedResults[row.sintoma].medicamentos.push({
                    nombre: row.medicamento,
                    dosis: row.dosis,
                    efectos: row.efectos
                });
            }
        });

        return new Response(JSON.stringify(groupedResults), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
    } catch (error) {
        await db.close();
        return new Response(JSON.stringify({ error: "Error al buscar en la base de datos" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
