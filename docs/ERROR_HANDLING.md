# Error Handling Rules

| Error Scenario | Scraper & App Action |
| :--- | :--- |
| **Timeout (Portal slow)** | Retry ticket up to 3 times with exponential backoff. |
| **Website Unavailable** | Pause process, log error, preserve current progress checkpoint. |
| **Invalid/Missing Hall Ticket** | Store record as `-` for Name, SGPA, CGPA, mark `is_missing=1`, continue immediately. |
| **Parsing Failure** | Save raw HTML snapshot in debug log, insert placeholder, continue to next ticket. |
| **User Stops/Interrupts** | Write checkpoint state to SQLite. Next job resumes from `last_processed + 1`. |
