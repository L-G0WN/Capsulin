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
      titulo TEXT NOT NULL UNIQUE,
      descripcion TEXT NOT NULL,
      recomendacion TEXT NOT NULL,
      emergencia TEXT NOT NULL,
      categoria TEXT,
      frecuencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      efectos TEXT NOT NULL,
      contraindicaciones TEXT,
      presentacion TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nombre, presentacion)
    )
  `);

  // Relación con dosis e intensidad específica
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sintoma_medicamento (
      sintoma_id INTEGER NOT NULL,
      medicamento_id INTEGER NOT NULL,
      dosis TEXT NOT NULL,
      duracion TEXT NOT NULL,
      intensidad TEXT NOT NULL,
      PRIMARY KEY (sintoma_id, medicamento_id, dosis, intensidad),
      FOREIGN KEY (sintoma_id) REFERENCES sintomas(id) ON DELETE CASCADE,
      FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE
    )
  `);

  await db.close();
  console.log('Tablas creadas exitosamente');
};

const main = async () => {
  await init();
};

main().catch(err => {
  console.error('Error:', err);
});