import { URL_SCRIPT } from '../config.js';
import { loadAll } from './loadSheets.js';

function reloadAfterMutation() {
  setTimeout(loadAll, 1000);
}

export async function postNovaEscala(payload) {
  await fetch(URL_SCRIPT, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  reloadAfterMutation();
}

export async function postNovoMilitar(payload) {
  await fetch(URL_SCRIPT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  reloadAfterMutation();
}

export async function postNovaOperacao(payload) {
  await fetch(URL_SCRIPT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  reloadAfterMutation();
}
