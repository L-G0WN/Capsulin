import { getDb } from '@/lib/db';

const init = async () => {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      security_question1 VARCHAR(255),
      answer1 VARCHAR(255) NOT NULL,
      security_question2 VARCHAR(255),
      answer2 VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sintomas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL UNIQUE,
      descripcion TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      activo VARCHAR(255) NOT NULL,
      efectos TEXT NOT NULL,
      categorias TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nombre, activo)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sintoma_medicamento (
      sintoma_id INT NOT NULL,
      medicamento_id INT NOT NULL,
      intensidad VARCHAR(255) NOT NULL,
      PRIMARY KEY (sintoma_id, medicamento_id, intensidad),
      FOREIGN KEY (sintoma_id) REFERENCES sintomas(id) ON DELETE CASCADE,
      FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE
    )
  `);

  console.log('Tablas creadas exitosamente');
};

const main = async () => {
  await init();
  process.exit(0);
};

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});