import { getDb } from '@/lib/db';
import { hashed } from '@/lib/auth';

const insertAdmin = async () => {
  const db = getDb();

  const username = 'Capsulin';
  const first_name = 'Admin';
  const last_name = 'Principal';
  const security_question1 = '¿Cuál era el nombre de tu primera mascota?';
  const answer1 = 'Azul';
  const security_question2 = '¿Cuál es tu comida favorita?';
  const answer2 = 'Perros';
  const password = 'admin123';

  const passwordHash = await hashed(password);
  const security_question1Hash = await hashed(security_question1);
  const answer1Hash = await hashed(answer1);
  const security_question2Hash = await hashed(security_question2);
  const answer2Hash = await hashed(answer2);

  await db.execute(
    `INSERT IGNORE INTO users 
      (username, first_name, last_name, security_question1, answer1, security_question2, answer2, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      first_name,
      last_name,
      security_question1Hash,
      answer1Hash,
      security_question2Hash,
      answer2Hash,
      passwordHash
    ]
  );

  console.log('Usuario administrador insertado');
};

insertAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});