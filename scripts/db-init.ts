import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const init = async () => {
  const db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sintomas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      recomendacion TEXT NOT NULL,
      emergencia TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dosis TEXT NOT NULL,
      efectos TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nombre)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sintoma_medicamento (
      sintoma_id INTEGER NOT NULL,
      medicamento_id INTEGER NOT NULL,
      PRIMARY KEY (sintoma_id, medicamento_id),
      FOREIGN KEY (sintoma_id) REFERENCES sintomas(id) ON DELETE CASCADE,
      FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE
    )
  `);

  await db.close();
  console.log('Tablas creadas exitosamente');
};

const insertData = async () => {
  const db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database,
  });

  // Insertar síntomas
  const sintomas = [
    {
      titulo: 'Dolor de cabeza',
      descripcion: 'Dolor en la cabeza que puede variar en intensidad.',
      recomendacion: 'Descansar en un lugar oscuro y tranquilo.',
      emergencia: 'Si el dolor es muy intenso o persiste.',
    },
    {
      titulo: 'Gripe',
      descripcion: 'Infección viral que afecta el sistema respiratorio.',
      recomendacion: 'Mantenerse hidratado y descansar.',
      emergencia: 'Si hay dificultad para respirar.',
    },
    {
      titulo: 'Alergias',
      descripcion: 'Reacción del sistema inmunológico a sustancias.',
      recomendacion: 'Evitar el alérgeno y tomar antihistamínicos.',
      emergencia: 'Si hay dificultad para respirar o hinchazón.',
    },
  ];

  for (const sintoma of sintomas) {
    await db.run(`
      INSERT INTO sintomas (titulo, descripcion, recomendacion, emergencia)
      VALUES (?, ?, ?, ?)
    `, [sintoma.titulo, sintoma.descripcion, sintoma.recomendacion, sintoma.emergencia]);
  }

  // Insertar medicamentos
  const medicamentos = [
    {
      nombre: 'Paracetamol',
      dosis: '500mg',
      efectos: 'Alivio del dolor y reducción de fiebre.',
    },
    {
      nombre: 'Ibuprofeno',
      dosis: '400mg',
      efectos: 'Alivio del dolor y antiinflamatorio.',
    },
    {
      nombre: 'Antihistaminico',
      dosis: '10mg',
      efectos: 'Alivio de síntomas alérgicos.',
    },
  ];

  for (const medicamento of medicamentos) {
    await db.run(`
      INSERT INTO medicamentos (nombre, dosis, efectos)
      VALUES (?, ?, ?)
    `, [medicamento.nombre, medicamento.dosis, medicamento.efectos]);
  }

  // Relacionar síntomas con medicamentos
  const relaciones = [
    { sintoma: 'Dolor de cabeza', medicamento: 'Paracetamol' },
    { sintoma: 'Gripe', medicamento: 'Ibuprofeno' },
    { sintoma: 'Alergias', medicamento: 'Antihistaminico' },
  ];

  for (const { sintoma, medicamento } of relaciones) {
    const sintomaId = await db.get(`SELECT id FROM sintomas WHERE titulo = ?`, [sintoma]);
    const medicamentoId = await db.get(`SELECT id FROM medicamentos WHERE nombre = ?`, [medicamento]);

    if (sintomaId && medicamentoId) {
      await db.run(`
        INSERT INTO sintoma_medicamento (sintoma_id, medicamento_id)
        VALUES (?, ?)
      `, [sintomaId.id, medicamentoId.id]);
    }
  }

  await db.close();
  console.log('Datos insertados exitosamente');
};

// Inicializar la base de datos y luego insertar datos
const main = async () => {
  await init();
  await insertData();
};

main().catch(err => {
  console.error('Error:', err);
});
