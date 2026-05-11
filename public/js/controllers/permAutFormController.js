import { store } from '../state/store.js';
import { paNomeMilitar } from '../utils/permutaAutHelpers.js';
import { postNovaPermAut } from '../services/appsScriptApi.js';

let paSubmitting = false;

function primeSubmitButton(btnId) {
  const el = document.getElementById(btnId);
  if (!el || el.dataset.labelDefault != null) return;
  el.dataset.labelDefault = el.textContent.trim();
}

function setPaModalSaving(saving, busyLabel = 'Enviando…') {
  const overlay = document.getElementById('perm-aut-modal-overlay');
  const submit = document.getElementById('btn-submit-perm-aut');
  primeSubmitButton('btn-submit-perm-aut');
  if (!overlay || !submit) return;
  overlay.querySelectorAll('.modal-actions button').forEach((b) => {
    if (saving) b.disabled = true;
    else b.disabled = false;
  });
  if (saving) {
    submit.disabled = true;
    submit.textContent = busyLabel;
    submit.classList.add('btn-busy');
  } else {
    submit.classList.remove('btn-busy');
    submit.textContent = submit.dataset.labelDefault || submit.textContent;
  }
}

function syncMesAnoDaData() {
  const inp = document.getElementById('pa-nova-data');
  const mesEl = document.getElementById('pa-nova-mes');
  const anoEl = document.getElementById('pa-nova-ano');
  if (!inp?.value || !mesEl || !anoEl) return;
  const dt = new Date(inp.value + 'T12:00:00');
  if (isNaN(dt.getTime())) return;
  mesEl.value = dt.toLocaleDateString('pt-BR', { month: 'long' });
  anoEl.value = String(dt.getFullYear());
}

function bindPermAutModalOnce() {
  const root = document.getElementById('perm-aut-modal-overlay');
  if (!root || root.dataset.bound === '1') return;
  root.dataset.bound = '1';
  document.getElementById('pa-nova-data')?.addEventListener('change', () => {
    syncMesAnoDaData();
    syncPaSubmitButton();
  });
  document.getElementById('pa-nova-data')?.addEventListener('input', () => {
    syncMesAnoDaData();
    syncPaSubmitButton();
  });
  ['pa-detalhe', 'pa-obs'].forEach((id) =>
    document.getElementById(id)?.addEventListener('input', syncPaSubmitButton),
  );
  document.getElementById('pa-nova-tipo')?.addEventListener('change', syncPaSubmitButton);
  document.getElementById('pa-nova-ord')?.addEventListener('change', () => {
    syncPaNomePreview();
    syncPaSubmitButton();
  });
}

function syncPaNomePreview() {
  const ord = document.getElementById('pa-nova-ord')?.value?.trim();
  const el = document.getElementById('pa-preview-nome');
  if (!el) return;
  el.textContent = ord ? paNomeMilitar(ord, store.allMilitares) || '— não encontrado no cadastro' : '—';
}

export function syncPaSubmitButton() {
  const btn = document.getElementById('btn-submit-perm-aut');
  if (!btn || paSubmitting) return;
  primeSubmitButton('btn-submit-perm-aut');

  const data = document.getElementById('pa-nova-data')?.value?.trim();
  const ord = document.getElementById('pa-nova-ord')?.value?.trim();
  const mes = document.getElementById('pa-nova-mes')?.value?.trim();
  const ano = document.getElementById('pa-nova-ano')?.value?.trim();
  const tipo = document.getElementById('pa-nova-tipo')?.value?.trim();

  btn.disabled = !(data && ord && mes && ano && tipo);
}

function paFormComplete() {
  return !!(
    document.getElementById('pa-nova-data')?.value?.trim() &&
    document.getElementById('pa-nova-ord')?.value?.trim() &&
    document.getElementById('pa-nova-mes')?.value?.trim() &&
    document.getElementById('pa-nova-ano')?.value?.trim() &&
    document.getElementById('pa-nova-tipo')?.value?.trim()
  );
}

export function openPermAutModal() {
  paSubmitting = false;
  document.getElementById('perm-aut-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  primeSubmitButton('btn-submit-perm-aut');
  bindPermAutModalOnce();

  const sel = document.getElementById('pa-nova-ord');
  if (sel) {
    sel.innerHTML = store.allMilitares
      .slice()
      .sort((a, b) => Number(a['ORD'] || 0) - Number(b['ORD'] || 0))
      .map(
        (m) =>
          `<option value="${m['ORD']}">${m['NOME'] || m['MILITAR'] || m['ORD']}</option>`,
      )
      .join('');
  }

  document.getElementById('pa-nova-data').value = '';
  document.getElementById('pa-nova-mes').value = '';
  document.getElementById('pa-nova-ano').value = '';
  document.getElementById('pa-detalhe').value = '';
  document.getElementById('pa-obs').value = '';
  const tipoSel = document.getElementById('pa-nova-tipo');
  if (tipoSel) tipoSel.value = 'PERMUTA';

  syncPaNomePreview();
  setPaModalSaving(false);
  syncPaSubmitButton();
}

export function closePermAutModal() {
  paSubmitting = false;
  setPaModalSaving(false);
  syncPaSubmitButton();
  document.getElementById('perm-aut-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export async function enviarPermAut() {
  if (!paFormComplete() || paSubmitting) return;

  const payload = {
    action: 'nova_perm_aut',
    data: document.getElementById('pa-nova-data').value.trim(),
    numero: document.getElementById('pa-nova-ord').value.trim(),
    mes: document.getElementById('pa-nova-mes').value.trim(),
    ano: document.getElementById('pa-nova-ano').value.trim(),
    tipo: document.getElementById('pa-nova-tipo').value.trim(),
    detalhe: document.getElementById('pa-detalhe').value.trim(),
    obs: document.getElementById('pa-obs').value.trim(),
  };

  paSubmitting = true;
  setPaModalSaving(true);

  try {
    console.log('[perm-aut] payload enviado', payload);
    const res = await postNovaPermAut(payload);
    console.log('[perm-aut] resposta tratada como sucesso', res);
    alert('Registro gravado na aba PERM E AUT.');
    closePermAutModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao gravar: ' + (err.message || err));
  } finally {
    paSubmitting = false;
    setPaModalSaving(false);
    syncPaSubmitButton();
  }
}
