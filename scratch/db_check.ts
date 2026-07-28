import dotenv from "dotenv";
dotenv.config();
import { db } from "../src/server/database.js";

async function main() {
  await db.initMySQL();
  const stats = await db.getStats();
  console.log("=== Database Stats ===");
  console.log(stats);

  if (db.mysqlPool) {
    const [students] = await db.mysqlPool.query<any[]>("SELECT COUNT(*) as count FROM students");
    console.log("Students Count:", students[0].count);

    const [subjects] = await db.mysqlPool.query<any[]>("SELECT COUNT(*) as count FROM student_subjects");
    console.log("Student Subjects Count:", subjects[0].count);

    const [compOrg] = await db.mysqlPool.query<any[]>(
      "SELECT COUNT(*) as count FROM student_subjects WHERE subject_name = 'Computer Organization'"
    );
    console.log("Computer Organization matches:", compOrg[0].count);

    const [rangeCheck] = await db.mysqlPool.query<any[]>(
      `SELECT s.hall_ticket, s.name, ss.subject_name 
       FROM students s 
       JOIN student_subjects ss ON s.hall_ticket = ss.hall_ticket 
       WHERE ss.subject_name = 'Computer Organization' 
       AND s.hall_ticket BETWEEN '1602-24-737-001' AND '1602-24-737-152'
       ORDER BY s.hall_ticket ASC`
    );
    console.log("MySQL range query matches count:", rangeCheck.length);
    console.log("Matched hall tickets list:", rangeCheck.map(r => r.hall_ticket));
  }
  process.exit(0);
}

main().catch(console.error);
