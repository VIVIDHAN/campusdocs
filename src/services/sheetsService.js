const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

/**
 * Logs a document generation event to Google Sheets via Apps Script.
 * Fire-and-forget — never blocks the UI.
 */
export async function logGeneration(payload) {
  if (!SHEET_URL) return;
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script doesn't return CORS headers
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch {
    // Silently fail — logging should never break the app
  }
}
