/**
 * ============================================================
 * KONFIGURASI FRONTEND — Vercel Serverless / Google Apps Script
 * ============================================================
 * Pada deployment Vercel, panggilan diarahkan ke endpoint internal
 * serverless /api/rpc sehingga lebih cepat, aman, dan tanpa batasan CORS.
 * ============================================================
 */
window.GAS_URL = (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.startsWith('file:'))
  ? '/api/rpc'
  : 'https://script.google.com/macros/s/AKfycbylQqkQ41b66Qrkgu110YOWI4fCxeN8F8J8J06ucVC6x5WNRYh1z5wAeKz4ldrblQll/exec';
