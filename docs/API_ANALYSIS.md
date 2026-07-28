# VCE Results Portal API Analysis

## Target Endpoint
- **URL**: `https://sis.vce.ac.in/Results_BE_02-07-2026/`
- **Method**: POST
- **Form Parameters**:
  - `htno`: Hall Ticket Number (e.g. `1602-24-737-001`)
  - `btnSubmit`: "Submit"

## Response Elements
- **Student Details Table**:
  - `Name of the Candidate`: `td.name` or 2nd column
  - `Father Name`: `td.fname`
  - `Course / Branch`: `td.branch`
- **GPA Table**:
  - `SGPA`: `span#lblSGPA` / `td:contains('SGPA')`
  - `CGPA`: `span#lblCGPA` / `td:contains('CGPA')`
- **Subject Grades Table**:
  - Columns: `Subject Code`, `Subject Name`, `Credits`, `Grade`

## Resilience Strategy
If HTTP requests fail due to portal offline status or anti-bot blocks, the scraper automatically falls back to local mock server generation for seamless testing while logging the warning.
