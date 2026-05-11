import { URL_SCRIPT } from "../config.js";
import { loadAll } from "./loadSheets.js";

const GAS_LOG = "[GAS]";

function reloadAfterMutation(action) {
  console.log(`${GAS_LOG} Recarregar dados em ~1s (após ${action})…`);
  setTimeout(loadAll, 1000);
}

function optsFor(body) {
  const jsonBody = JSON.stringify(body);
  if (body.action === "nova_operacao") {
    return { method: "POST", body: jsonBody };
  }
  const o = {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: jsonBody,
  };
  /** Apps Script Web App — explícito evita comportamentos estranhos em alguns navegadores. */
  if (body.action === "nova_escala" || body.action === "nova_perm_aut")
    o.mode = "cors";
  return o;
}

async function gasResponse(res, action) {
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (_) {
    /** resposta não-JSON */
  }

  console.log(`${GAS_LOG} ${action}`, {
    url: URL_SCRIPT,
    ok: res.ok,
    status: res.status,
    bytes: text.length,
    preview: text.slice(0, 280).replace(/\s+/g, " "),
  });

  if (!res.ok) {
    console.error(`${GAS_LOG} ${action} HTTP falhou`, text.slice(0, 400));
    throw new Error(
      `HTTP ${res.status}${text ? ` — ${text.slice(0, 160)}` : ""}`,
    );
  }

  if (data == null || typeof data !== "object") {
    console.error(
      `${GAS_LOG} ${action} resposta não é JSON (cookie/login/HTML?)`,
      text.slice(0, 600),
    );
    throw new Error(
      "Resposta do script não é JSON. Confirme URL do deploy, permissões do Web App e abra Executions no Apps Script.",
    );
  }

  if (data.success !== true) {
    const msg = String(data.error || "Falha gravando na planilha");
    console.error(`${GAS_LOG} ${action} success=false`, data);
    throw new Error(msg);
  }

  console.log(`${GAS_LOG} ${action} ✓ OK`, data);
  return data;
}

async function gasFetch(body) {
  const action = body?.action ?? "(sem action)";
  console.log(`${GAS_LOG} enviando POST`, action, body);
  const res = await fetch(URL_SCRIPT, optsFor(body));
  return gasResponse(res, action);
}

export async function postNovaEscala(payload) {
  await gasFetch(payload);
  reloadAfterMutation(payload.action);
}

export async function postNovoMilitar(payload) {
  await gasFetch(payload);
  reloadAfterMutation(payload.action);
}

export async function postNovaOperacao(payload) {
  await gasFetch(payload);
  reloadAfterMutation(payload.action);
}

export async function postNovaPermAut(payload) {
  const out = await gasFetch(payload);
  reloadAfterMutation(payload.action);
  return out;
}
