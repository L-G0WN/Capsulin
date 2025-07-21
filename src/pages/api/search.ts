import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";
import type { Medicamento, MedicamentoRelacion, Sintoma } from "@/types.ts";

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('query')?.toLowerCase() || '';
    const db = await getDb();

    try {
        // Buscar síntomas y medicamentos mencionados en el query
        const sintomasRaw = await db.all('SELECT id, titulo FROM sintomas');
        const medicamentosRaw = await db.all('SELECT id, nombre FROM medicamentos');

        const sintomasNames: string[] = [];
        sintomasRaw.forEach((sintoma: { id: number, titulo: string }) => {
            if (query.includes(sintoma.titulo.toLowerCase())) {
                sintomasNames.push(sintoma.titulo);
            }
        });

        const medicationNames: string[] = [];
        medicamentosRaw.forEach((medicamento: { id: number, nombre: string }) => {
            if (query.includes(medicamento.nombre.toLowerCase())) {
                medicationNames.push(medicamento.nombre);
            }
        });

        // Detectar intensidad en el query
        let intensidad = "";
        if (query.includes("muy fuerte")) intensidad = "Muy Fuerte";
        else if (query.includes("medio")) intensidad = "Medio";
        else if (query.includes("normal")) intensidad = "Normal";

        // Consulta los síntomas cuyos títulos coinciden con los nombres encontrados
        const sintomas: Sintoma[] = sintomasNames.length > 0
            ? await db.all(
                `SELECT id, titulo as sintoma, descripcion, recomendacion, emergencia, categoria, frecuencia
                 FROM sintomas WHERE titulo IN (${sintomasNames.map(() => '?').join(',')})`,
                ...sintomasNames
            )
            : [];

        // Consulta los medicamentos cuyos nombres coinciden con los nombres encontrados
        const medicamentos: Medicamento[] = medicationNames.length > 0
            ? await db.all(
                `SELECT id, nombre, efectos, contraindicaciones, presentacion
                 FROM medicamentos WHERE nombre IN (${medicationNames.map(() => '?').join(',')})`,
                ...medicationNames
            )
            : [];

        // Relacionar medicamentos con síntomas y filtrar por intensidad si corresponde
        for (const sintoma of sintomas) {
            let rels: MedicamentoRelacion[] = [];
            if (intensidad) {
                rels = await db.all(`
                    SELECT m.id, m.nombre, sm.dosis, sm.duracion, sm.intensidad, m.efectos, m.contraindicaciones, m.presentacion
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    WHERE sm.sintoma_id = ? AND sm.intensidad = ?
                    ORDER BY RANDOM()
                    LIMIT 2
                `, [sintoma.id, intensidad]);
                // Si no hay medicamentos para esa intensidad, dejar el array vacío
                if (!rels || rels.length === 0) {
                    sintoma.medicamentos = [];
                    sintoma.sinMedicamentosPorIntensidad = true;
                    continue;
                }
            } else {
                rels = await db.all(`
                    SELECT m.id, m.nombre, sm.dosis, sm.duracion, sm.intensidad, m.efectos, m.contraindicaciones, m.presentacion
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    WHERE sm.sintoma_id = ?
                    ORDER BY RANDOM()
                    LIMIT 2
                `, [sintoma.id]);
            }
            sintoma.medicamentos = rels ?? [];
        }

        // Para medicamentos directos, mostrar los síntomas que trata y las dosis/intensidad
        for (const medicamento of medicamentos) {
            const sintomasRelacionados = await db.all(`
                SELECT s.titulo, sm.dosis, sm.duracion, sm.intensidad
                FROM sintoma_medicamento sm
                JOIN sintomas s ON sm.sintoma_id = s.id
                WHERE sm.medicamento_id = ?
            `, [medicamento.id]);
            medicamento.sintomas = sintomasRelacionados.map(s => `${s.titulo} (${s.dosis}, ${s.duracion}, ${s.intensidad})`);
        }

        await db.close();

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
        await db.close();
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