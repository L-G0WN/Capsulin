import { getDb } from "@/lib/db.ts";

interface QuickReplyItem {
  id: string;
  name: string;
  type: 'symptom' | 'medication';
}

interface Symptom {
  id: number;
  titulo: string;
}

interface Medication {
  id: number;
  nombre: string;
}

export async function getQuickReplies(): Promise<QuickReplyItem[]> {
  const db = await getDb();
  
  try {
    // Realizar ambas consultas en paralelo
    const [symptoms, medications] = await Promise.all([
      db.all<Symptom>("SELECT id, titulo FROM sintomas ORDER BY titulo"),
      db.all<Medication>("SELECT id, nombre FROM medicamentos ORDER BY nombre")
    ]);

    await db.close();

    // Verifica que los resultados sean arrays
    if (!Array.isArray(symptoms) || !Array.isArray(medications)) {
      console.error("Los resultados de las consultas no son arrays.");
      return [];
    }

    // Mapea los resultados a QuickReplyItem
    const symptomList: QuickReplyItem[] = symptoms.map(s => ({
      id: `symptom-${s.id}`,
      name: s.titulo,
      type: 'symptom'
    }));

    const medicationList: QuickReplyItem[] = medications.map(m => ({
      id: `medication-${m.id}`,
      name: m.nombre,
      type: 'medication'
    }));

    return [...symptomList, ...medicationList];
    
  } catch (error) {
    await db.close();
    console.error("Error fetching quick replies:", error);
    return [];
  }
}
