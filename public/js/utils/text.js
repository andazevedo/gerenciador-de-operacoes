import { MES_ORDER } from '../config.js';

/** Google Sheets: BOM no 1º cabeçalho e espaços. */
export function normalizeHeader(h) {
  return String(h || '').replace(/^\uFEFF/, '').trim();
}

export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export function formatData(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('pt-BR');
}

export function uniq(arr) {
  return [...new Set(arr)].filter(Boolean);
}

export function sortMes(arr) {
  return [...arr].sort(
    (a, b) => (MES_ORDER[a.toLowerCase()] || 99) - (MES_ORDER[b.toLowerCase()] || 99),
  );
}

export function setStatus(kind, msg) {
  const dot = document.getElementById('dot');
  const txt = document.getElementById('status-text');
  if (txt && msg != null) txt.textContent = msg;
  if (!dot) return;
  let extra = '';
  if (kind === 'loading') extra = ' loading';
  else if (kind === 'error') extra = ' error';
  else if (kind === 'warn') extra = ' warn';
  dot.className = 'dot' + extra;
}
