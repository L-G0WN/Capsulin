import { getDb } from "@/lib/db.ts";
import type { APIRoute } from "astro";
import type { Medicamento, MedicamentoRelacion, Sintoma } from "@/types.ts";

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('query')?.toLowerCase() || '';
    const db = await getDb();

    // Obtener presentaciones y dosis directamente de la base de datos
    const presentacionesRaw = await db.all('SELECT id, nombre FROM presentaciones');
    const dosisRaw = await db.all('SELECT id, cantidad FROM dosis');

    const presentacionesLower = presentacionesRaw.map(p => p.nombre.toLowerCase());
    const queryWords = query.split(/\s+/).filter(Boolean);

    // Detecta presentaciones mencionadas en el query
    const presentacionesEncontradas = presentacionesLower.filter(p => queryWords.includes(p));

    // Detecta dosis mencionadas en el query
    const dosisEncontradas = dosisRaw
        .filter(d => query.includes(d.cantidad.toLowerCase()))
        .map(d => d.cantidad);

    try {
        // Buscar síntomas y medicamentos mencionados en el query
        const sintomasRaw = await db.all('SELECT id, titulo FROM sintomas');
        const medicamentosRaw = await db.all('SELECT id, nombre, presentacion_id FROM medicamentos');

        // Buscar síntomas por coincidencia de frase completa en el query
        const sintomasNames: string[] = [];
        sintomasRaw.forEach((sintoma: { id: number, titulo: string }) => {
            if (query.includes(sintoma.titulo.toLowerCase())) {
                sintomasNames.push(sintoma.titulo);
            }
        });

        // Buscar medicamentos por coincidencia de frase completa en el query
        const medicationNames: string[] = [];
        medicamentosRaw.forEach((medicamento: { id: number, nombre: string }) => {
            if (query.includes(medicamento.nombre.toLowerCase())) {
                medicationNames.push(medicamento.nombre);
            }
        });

        // Buscar medicamentos por presentación usando la tabla presentaciones
        let medicamentosPorPresentacion: Medicamento[] = [];
        if (presentacionesEncontradas.length > 0) {
            const presentacionesIds = presentacionesRaw
                .filter(p => presentacionesEncontradas.includes(p.nombre.toLowerCase()))
                .map(p => p.id);
            if (presentacionesIds.length > 0) {
                medicamentosPorPresentacion = await db.all(
                    `SELECT id, nombre, efectos, contraindicaciones, presentacion_id
                     FROM medicamentos WHERE presentacion_id IN (${presentacionesIds.map(() => '?').join(',')})`,
                    ...presentacionesIds
                );
            }
        }

        // Buscar medicamentos por dosis si hay dosis encontradas
        let medicamentosPorDosis: Medicamento[] = [];
        if (dosisEncontradas.length > 0) {
            medicamentosPorDosis = await db.all(
                `SELECT m.id, m.nombre, m.efectos, m.contraindicaciones, m.presentacion_id
                 FROM medicamentos m
                 JOIN sintoma_medicamento sm ON sm.medicamento_id = m.id
                 JOIN dosis d ON sm.dosis_id = d.id
                 WHERE d.cantidad IN (${dosisEncontradas.map(() => '?').join(',')})`,
                ...dosisEncontradas
            );
        }

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
        const medicamentosPorNombre: Medicamento[] = medicationNames.length > 0
            ? await db.all(
                `SELECT id, nombre, efectos, contraindicaciones, presentacion_id
                 FROM medicamentos WHERE nombre IN (${medicationNames.map(() => '?').join(',')})`,
                ...medicationNames
            )
            : [];

        // Unir medicamentos encontrados por nombre, presentación y dosis, evitando duplicados
        const medicamentos: Medicamento[] = [
            ...medicamentosPorNombre,
            ...medicamentosPorPresentacion.filter(
                m => !medicamentosPorNombre.some(mm => mm.id === m.id)
            ),
            ...medicamentosPorDosis.filter(
                m => !medicamentosPorNombre.some(mm => mm.id === m.id) &&
                     !medicamentosPorPresentacion.some(mp => mp.id === m.id)
            )
        ];

        // Relacionar medicamentos con síntomas y filtrar por intensidad si corresponde
        for (const sintoma of sintomas) {
            let rels: MedicamentoRelacion[] = [];
            if (intensidad) {
                rels = await db.all(`
                    SELECT m.id, m.nombre, d.cantidad as dosis, sm.duracion, sm.intensidad, m.efectos, m.contraindicaciones, m.presentacion_id
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    JOIN dosis d ON sm.dosis_id = d.id
                    WHERE sm.sintoma_id = ? AND sm.intensidad = ?
                    ORDER BY RANDOM()
                    LIMIT 2
                `, [sintoma.id, intensidad]);
                if (!rels || rels.length === 0) {
                    sintoma.medicamentos = [];
                    sintoma.sinMedicamentosPorIntensidad = true;
                    continue;
                }
            } else {
                rels = await db.all(`
                    SELECT m.id, m.nombre, d.cantidad as dosis, sm.duracion, sm.intensidad, m.efectos, m.contraindicaciones, m.presentacion_id
                    FROM sintoma_medicamento sm
                    JOIN medicamentos m ON sm.medicamento_id = m.id
                    JOIN dosis d ON sm.dosis_id = d.id
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
                SELECT s.titulo, d.cantidad as dosis, sm.duracion, sm.intensidad
                FROM sintoma_medicamento sm
                JOIN sintomas s ON sm.sintoma_id = s.id
                JOIN dosis d ON sm.dosis_id = d.id
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