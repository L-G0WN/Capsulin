import { getDb } from "@/lib/db.ts";

export const PAGE_SIZE = 5;

export async function getPaginationData(url: URL) {
    const db = await getDb();

    const medPage = Number(url.searchParams.get("medPage") || 1);
    const sintPage = Number(url.searchParams.get("sintPage") || 1);
    const relPage = Number(url.searchParams.get("relPage") || 1);
    const presPage = Number(url.searchParams.get("presPage") || 1);
    const dosisPage = Number(url.searchParams.get("dosisPage") || 1);

    // Medicamentos
    const medTotal = (await db.all("SELECT COUNT(*) as c FROM medicamentos"))[0].c;
    const medOffset = (medPage - 1) * PAGE_SIZE;
    const medicamentos = await db.all(
        `SELECT m.id, m.nombre, m.efectos, p.nombre as presentacion, m.contraindicaciones
         FROM medicamentos m
         LEFT JOIN presentaciones p ON m.presentacion_id = p.id
         ORDER BY m.nombre ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        medOffset,
    );

    // Presentaciones
    const presTotal = (await db.all("SELECT COUNT(*) as c FROM presentaciones"))[0].c;
    const presOffset = (presPage - 1) * PAGE_SIZE;
    const presentaciones = await db.all(
        `SELECT id, nombre FROM presentaciones ORDER BY nombre ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        presOffset,
    );

    // Dosis
    const dosisTotal = (await db.all("SELECT COUNT(*) as c FROM dosis"))[0].c;
    const dosisOffset = (dosisPage - 1) * PAGE_SIZE;
    const dosis = await db.all(
        `SELECT id, cantidad FROM dosis ORDER BY cantidad ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        dosisOffset,
    );

    // Síntomas
    const sintTotal = (await db.all("SELECT COUNT(*) as c FROM sintomas"))[0].c;
    const sintOffset = (sintPage - 1) * PAGE_SIZE;
    const sintomas = await db.all(
        `SELECT id, titulo, descripcion, recomendacion, emergencia, categoria, frecuencia FROM sintomas ORDER BY titulo ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        sintOffset,
    );

    // Relaciones
    const relTotal = (await db.all("SELECT COUNT(*) as c FROM sintoma_medicamento"))[0].c;
    const relOffset = (relPage - 1) * PAGE_SIZE;
    const relaciones = await db.all(
        `SELECT sm.sintoma_id, sm.medicamento_id, d.cantidad as dosis, sm.duracion, sm.intensidad,
                  s.titulo as sintoma, m.nombre as medicamento
           FROM sintoma_medicamento sm
           JOIN sintomas s ON sm.sintoma_id = s.id
           JOIN medicamentos m ON sm.medicamento_id = m.id
           JOIN dosis d ON sm.dosis_id = d.id
           ORDER BY s.titulo, m.nombre
           LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        relOffset,
    );

    return {
        medPage, sintPage, relPage, presPage, dosisPage,
        medTotal, sintTotal, relTotal, presTotal, dosisTotal,
        medicamentos, sintomas, relaciones, presentaciones, dosis,
        PAGE_SIZE,
    };
}