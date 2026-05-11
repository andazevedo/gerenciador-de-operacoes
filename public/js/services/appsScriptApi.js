import { URL_SCRIPT } from '../config.js';
import { loadAll } from './loadSheets.js';

function reloadAfterMutation() {
  setTimeout(loadAll, 1000);
}

async function fetchErrorHint(res) {
  const snippet = await res.text().catch(() => '');
  return snippet ? ` (${snippet.slice(0, 120)})` : '';
}

export async function postNovaEscala(payload) {
  const res = await fetch(URL_SCRIPT, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Servidor respondeu ${res.status}${await fetchErrorHint(res)}`);
  }
  reloadAfterMutation();
}

export async function postNovoMilitar(payload) {
  const res = await fetch(URL_SCRIPT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Servidor respondeu ${res.status}${await fetchErrorHint(res)}`);
  }
  reloadAfterMutation();
}

export async function postNovaOperacao(payload) {
  const res = await fetch(URL_SCRIPT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Servidor respondeu ${res.status}${await fetchErrorHint(res)}`);
  }
  reloadAfterMutation();
}
