import dotenv from "dotenv";
dotenv.config();
import { db } from "../src/server/database.js";

async function main() {
  await db.initMongoDB();
  const stats = await db.getStats();
  console.log("=== Database Stats ===");
  console.log(stats);

  if (db.mongoDb) {
    const studentsCount = await db.mongoDb.collection('students').countDocuments();
    console.log("Students Count:", studentsCount);

    const subjectsCount = await db.mongoDb.collection('student_subjects').countDocuments();
    console.log("Student Subjects Count:", subjectsCount);

    const compOrgCount = await db.mongoDb.collection('student_subjects')
      .countDocuments({ subject_name: 'Computer Organization' });
    console.log("Computer Organization matches:", compOrgCount);

    const rangeCheck = await db.mongoDb.collection('student_subjects')
      .aggregate([
        { $match: { subject_name: 'Computer Organization' } },
        { $lookup: {
            from: 'students',
            localField: 'hall_ticket',
            foreignField: 'hall_ticket',
            as: 'student'
        }},
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        { $match: { 
          hall_ticket: { 
            $gte: '1602-24-737-001', 
            $lte: '1602-24-737-152' 
          }
        }},
        { $sort: { hall_ticket: 1 } },
        { $project: { hall_ticket: 1, name: '$student.name', subject_name: 1 } }
      ])
      .toArray();
    console.log("MongoDB range query matches count:", rangeCheck.length);
    console.log("Matched hall tickets list:", rangeCheck.map(r => r.hall_ticket));
  }
  process.exit(0);
}

main().catch(console.error);