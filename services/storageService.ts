import { SurveyData } from '../types';

const STORAGE_KEY = 'civic_research_responses';

export const getResponses = (): SurveyData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading storage", error);
    return [];
  }
};

export const emailExists = (email: string): boolean => {
  if (!email) return false;
  const responses = getResponses();
  return responses.some(r => r.demographics.email && r.demographics.email.toLowerCase() === email.toLowerCase());
};

export const saveResponse = (response: SurveyData): void => {
  const current = getResponses();
  const updated = [...current, response];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // Dispatch event for live updates
  window.dispatchEvent(new Event('storage-update'));
};

export const clearResponses = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('storage-update'));
};

export const exportToCSV = (): void => {
  const data = getResponses();
  if (data.length === 0) return;

  const headers = [
    "ID", "Timestamp", "Name", "Email", "Age", "Gender", "Education", "Income",
    "Littering Score", "Traffic Delay (min)", "Medical Expense"
  ];

  const rows = data.map(d => [
    d.id, d.timestamp,
    d.demographics.name || '', d.demographics.email || '',
    d.demographics.age, d.demographics.gender, d.demographics.education, d.demographics.income,
    d.behavior.littering, d.economic.trafficDelay, d.economic.medicalExpenses
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "civic_research_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};