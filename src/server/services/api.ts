const API_URL = '';

export async function getStudents() {
  const response = await fetch(`${API_URL}/api/students`);
  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_URL}/api/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}

export async function getStudentByHallTicket(hallTicket: string) {
  const response = await fetch(`${API_URL}/api/student/${encodeURIComponent(hallTicket)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch student');
  }
  return response.json();
}

export async function getLogs() {
  const response = await fetch(`${API_URL}/api/logs`);
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  return response.json();
}

export async function clearLogs() {
  const response = await fetch(`${API_URL}/api/logs/clear`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to clear logs');
  }
  return response.json();
}

export async function clearDatabase() {
  const response = await fetch(`${API_URL}/api/db/clear`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to clear database');
  }
  return response.json();
}

export async function getRecentStudents() {
  const response = await fetch(`${API_URL}/api/recent-students`);
  if (!response.ok) {
    throw new Error('Failed to fetch recent students');
  }
  return response.json();
}

export async function getUniqueSubjectNames() {
  const response = await fetch(`${API_URL}/api/unique-subjects`);
  if (!response.ok) {
    throw new Error('Failed to fetch subject names');
  }
  return response.json();
}

export async function searchStudentsBySubject(query: string) {
  const response = await fetch(`${API_URL}/api/search-subject?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search students');
  }
  return response.json();
}

export async function getSubjectFilteredResults(params: { subject: string; prefix: string; start: string; end: string }) {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_URL}/api/subject-filtered?${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch filtered results');
  }
  return response.json();
}

export async function runClassResult(config: any) {
  const response = await fetch(`${API_URL}/api/class-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    throw new Error('Failed to run class result');
  }
  return response.json();
}

export async function runSubjectResult(config: { subject_name: string; prefix?: string; start?: string; end?: string; auto_fetch_missing?: boolean }) {
  const response = await fetch(`${API_URL}/api/subject-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    throw new Error('Failed to run subject result');
  }
  return response.json();
}

export async function getAdvancedAnalytics() {
  const response = await fetch(`${API_URL}/api/analytics/advanced`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
}

export async function getSubjectAnalytics(query: string) {
  const response = await fetch(`${API_URL}/api/analytics/subject?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch subject analytics');
  }
  return response.json();
}

export async function exportExcel(prefix: string, start: string, end: string) {
  const response = await fetch(`${API_URL}/api/export/excel?prefix=${prefix}&start=${start}&end=${end}`);
  if (!response.ok) {
    throw new Error('Failed to export Excel');
  }
  return response.blob();
}

export async function exportCsv(prefix: string, start: string, end: string) {
  const response = await fetch(`${API_URL}/api/export/csv?prefix=${prefix}&start=${start}&end=${end}`);
  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }
  return response.blob();
}

export async function exportJson(prefix: string, start: string, end: string) {
  const response = await fetch(`${API_URL}/api/export/json?prefix=${prefix}&start=${start}&end=${end}`);
  if (!response.ok) {
    throw new Error('Failed to export JSON');
  }
  return response.json();
}

export async function deleteStudents(hall_tickets: string[]) {
  const response = await fetch(`${API_URL}/api/students/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hall_tickets })
  });
  if (!response.ok) {
    throw new Error('Failed to delete students');
  }
  return response.json();
}

export async function getMongoStatus() {
  const response = await fetch(`${API_URL}/api/mongodb/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch MongoDB status');
  }
  return response.json();
}

export async function connectMongo(config: { uri: string; database: string; enabled: boolean }) {
  const response = await fetch(`${API_URL}/api/mongodb/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    throw new Error('Failed to connect to MongoDB');
  }
  return response.json();
}