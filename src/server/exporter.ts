import XLSX from 'xlsx';
import { Student } from '../types.js';

export function generateExcelBuffer(students: Student[]): Buffer {
  const rows = students.map(s => ({
    'Hall Ticket': s.hall_ticket,
    'Name': s.name || '-',
    'SGPA': s.sgpa || '-',
    'CGPA': s.cgpa || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['Hall Ticket', 'Name', 'SGPA', 'CGPA']
  });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 18 }, // Hall Ticket
    { wch: 25 }, // Name
    { wch: 10 }, // SGPA
    { wch: 10 }  // CGPA
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

export function generateCsvString(students: Student[]): string {
  const lines = ['Hall Ticket,Name,SGPA,CGPA'];

  for (const s of students) {
    const ht = s.hall_ticket;
    const name = (s.name || '-').includes(',') ? `"${s.name}"` : (s.name || '-');
    const sgpa = s.sgpa || '-';
    const cgpa = s.cgpa || '-';
    lines.push(`${ht},${name},${sgpa},${cgpa}`);
  }

  return lines.join('\n');
}
