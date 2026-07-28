# Data Model Specification

## Student Entity
```json
{
  "hall_ticket": "1602-24-737-001",
  "name": "K. Rahul Sharma",
  "father_name": "K. Srinivas",
  "course": "B.E. Computer Science & Engineering",
  "exam": "B.E. II-Sem (Main) July 2026",
  "sgpa": "9.18",
  "cgpa": "8.92",
  "is_missing": false,
  "subjects": [
    {
      "subject_code": "CS201",
      "subject_name": "Database Management Systems",
      "credits": 3.0,
      "semester": "II",
      "year": "2026",
      "grade": "A+"
    }
  ],
  "mandatory_requirements": [
    {
      "activity": "NSS / Sports",
      "status": "COMPLETED"
    }
  ]
}
```

## Missing Student Representation
When a hall ticket produces no record on the portal:
```json
{
  "hall_ticket": "1602-24-737-058",
  "name": "-",
  "father_name": "-",
  "course": "-",
  "exam": "-",
  "sgpa": "-",
  "cgpa": "-",
  "is_missing": true,
  "subjects": [],
  "mandatory_requirements": []
}
```
