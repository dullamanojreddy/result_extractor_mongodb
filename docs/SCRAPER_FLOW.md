# Scraper & Parser Flow

1. **Input Range Generation**:
   - Given prefix `1602-24-737-`, start `001`, end `120`.
   - Generates sequential list: `1602-24-737-001` through `1602-24-737-120`.

2. **Database Existence Check**:
   - For each hall ticket in the list, query `SELECT * FROM students WHERE hall_ticket = ?`.
   - If present in local SQLite DB, load directly from DB without calling the network portal.

3. **Portal Fetch (For Missing Records)**:
   - Send HTTP GET/POST to VCE Results Portal `https://sis.vce.ac.in/Results_BE_02-07-2026/`.
   - Post form data `htno=1602-24-737-XXX`.
   - Introduce configured delay (e.g., 2.0 seconds) to avoid rate-limiting.

4. **HTML Parsing**:
   - Extract DOM elements for Name, Course, SGPA, CGPA, and Subjects Table.
   - If page displays "Invalid Hall Ticket" or "Result Not Found", flag as missing.
   - Parse all subjects into structured data objects.

5. **Persistence & Checkpointing**:
   - Write full record (or `-` placeholder if missing) into SQLite.
   - Save checkpoint state so if process is stopped at ticket `074`, resume starts at `075`.
