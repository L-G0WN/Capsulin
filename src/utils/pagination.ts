import { getDb } from "@/lib/db.ts";

export const PAGE_SIZE = 5;

export async function getPaginationData(url: URL) {
    const db = await getDb();

    const medPage = Number(url.searchParams.get("medPage") || 1);
    const sintPage = Number(url.searchParams.get("sintPage") || 1);
    const relPage = Number(url.searchParams.get("relPage") || 1);

    // Síntomas
    const sintTotal = (await db.all("SELECT COUNT(*) as c FROM sintomas"))[0].c;
    const sintOffset = (sintPage - 1) * PAGE_SIZE;
    const sintomas = await db.all(
        `SELECT id, nombre, descripcion FROM sintomas ORDER BY nombre ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        sintOffset,
    );

    // Medicamentos
    const medTotal = (await db.all("SELECT COUNT(*) as c FROM medicamentos"))[0].c;
    const medOffset = (medPage - 1) * PAGE_SIZE;
    const medicamentos = await db.all(
        `SELECT m.id, m.nombre, m.activo, m.efectos, m.categorias
         FROM medicamentos m
         ORDER BY m.nombre ASC LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        medOffset,
    );

    // Relaciones
    const relTotal = (await db.all("SELECT COUNT(*) as c FROM sintoma_medicamento"))[0].c;
    const relOffset = (relPage - 1) * PAGE_SIZE;
    const relaciones = await db.all(
        `SELECT sm.sintoma_id, sm.medicamento_id, sm.intensidad,
                  s.nombre as sintoma, m.nombre as medicamento
           FROM sintoma_medicamento sm
           JOIN sintomas s ON sm.sintoma_id = s.id
           JOIN medicamentos m ON sm.medicamento_id = m.id
           ORDER BY s.nombre, m.nombre
           LIMIT ? OFFSET ?`,
        PAGE_SIZE,
        relOffset,
    );

    return {
        medPage, sintPage, relPage,
        medTotal, sintTotal, relTotal,
        medicamentos, sintomas, relaciones,
        PAGE_SIZE,
    };
}