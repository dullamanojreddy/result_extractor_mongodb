# UI Specification

## Theme & Visual Hierarchy
- Desktop application visual style.
- High contrast dark/light themes.
- Red prominent button for **CLASS RESULT**.
- Blue prominent button for **SUBJECT WISE RESULT**.
- Navigation panel: Settings, Database Statistics, Live Terminal Logs, Documentation Viewer.

## Component Layout
1. **Header Bar**: Title, DB Connection Status, Quick Stats pill, Theme Switcher, Docs button.
2. **Action Hub**:
   - 🔴 **CLASS RESULT** (Modal trigger: Range setup -> DB Check -> Live Progress -> Results Grid).
   - 🔵 **SUBJECT WISE RESULT** (Modal trigger: Subject search -> Immediate DB Table / Auto-Fetch Prompt).
3. **Control Bar**:
   - Start / Pause / Resume controls for current scraping jobs.
   - Progress bar with ticket counter (`54 / 120`), ETA, and found/missing counters.
4. **Data Grid**:
   - Filterable table displaying Hall Ticket, Name, SGPA, CGPA.
   - Export buttons: Excel (.xlsx), CSV (.csv).
5. **Log Terminal**: Real-time auto-scrolling log console.
