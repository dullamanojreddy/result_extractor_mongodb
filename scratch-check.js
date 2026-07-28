import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'results_db'
  });

  try {
    const tickets = ['1602-24-737-052', '1602-24-737-053'];
    
    for (const ht of tickets) {
      console.log(`\n=== Student: ${ht} ===`);
      const [students] = await connection.query('SELECT * FROM students WHERE hall_ticket = ?', [ht]);
      console.log('Student Info:', students[0]);

      const [subjects] = await connection.query('SELECT * FROM student_subjects WHERE hall_ticket = ?', [ht]);
      console.log('Subjects:', subjects);
    }
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await connection.end();
  }
}

main();
