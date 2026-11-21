/**
 * ============================================================
 * api/helpers/sheets.js — Helper Google Sheets API v4
 * Pengganti SpreadsheetApp pada Vercel Serverless (Node.js)
 * ============================================================
 */

export async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (err) {
    console.warn('googleapis package belum terpasang lokal:', err.message);
    return null;
  }
}

export async function readSheet(sheetName = 'Sheet1') {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!sheets || !spreadsheetId) return null;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName
    });
    return res.data.values || [];
  } catch (e) {
    console.error('Error readSheet:', e.message);
    return null;
  }
}

export async function appendSheet(sheetName = 'Sheet1', rowData = []) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!sheets || !spreadsheetId) return null;

  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowData] }
    });
    return res.data;
  } catch (e) {
    console.error('Error appendSheet:', e.message);
    return null;
  }
}
