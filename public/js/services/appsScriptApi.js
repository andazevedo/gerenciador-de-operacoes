import { URL_SCRIPT } from '../config.js';
import { loadAll } from './loadSheets.js';

function reloadAfterMutation() {
  setTimeout(loadAll, 1000);
}

function optsFor(body) {
  const jsonBody = JSON.stringify(body);
  if (body.action === 'nova_operacao') {
    return { method: 'POST', body: jsonBody };
  }
  const o = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: jsonBody,
  };
  if (body.action === 'nova_escala') o.mode = 'cors';
  return o;
}

async function gasResponse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (_) {
    /** resposta não-JSON (proxy / HTML) */
  }
  if (data?.success === false) {
    throw new Error(String(data.error || 'Falha gravando na planilha'));
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}${text ? ` — ${text.slice(0, 160)}` : ''}`);
  }
  return data;
}

async function gasFetch(body) {
  const res = await fetch(URL_SCRIPT, optsFor(body));
  return gasResponse(res);
}

export async function postNovaEscala(payload) {
  await gasFetch(payload);
  reloadAfterMutation();
}

export async function postNovoMilitar(payload) {
  await gasFetch(payload);
  reloadAfterMutation();
}

export async function postNovaOperacao(payload) {
  await gasFetch(payload);
  reloadAfterMutation();
}

export async function postNovaPermAut(payload) {
  await gasFetch(payload);
  reloadAfterMutation();
}
