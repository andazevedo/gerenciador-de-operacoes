import { store } from '../state/store.js';
import { postNovaEscala, postNovoMilitar, postNovaOperacao } from '../services/appsScriptApi.js';

let escalaSubmitting = false;
let militarSubmitting = false;
let operacaoSubmitting = false;

function primeSubmitButton(btnId) {
  const el = document.getElementById(btnId);
  if (!el || el.dataset.labelDefault != null) return;
  el.dataset.labelDefault = el.textContent.trim();
}

function setModalSaving(overlayId, submitBtnId, saving, busyLabel = 'Enviando…') {
  const overlay = document.getElementById(overlayId);
  primeSubmitButton(submitBtnId);
  const submit = document.getElementById(submitBtnId);
  if (!overlay || !submit) return;

  if (saving) {
    overlay.querySelectorAll('.modal-actions button').forEach((b) => {
      b.disabled = true;
    });
    submit.classList.add('btn-busy');
    submit.disabled = true;
    submit.textContent = busyLabel;
    return;
  }

  overlay.querySelectorAll('.modal-actions button').forEach((b) => {
    b.disabled = false;
  });
  submit.classList.remove('btn-busy');
  submit.textContent = submit.dataset.labelDefault || submit.textContent;
}

// ─── Nova escala ─────────────────────────────────────────────

function bindEscalaFormValidationOnce() {
  const root = document.getElementById('escala-modal-overlay');
  if (!root || root.dataset.formBound === '1') return;
  root.dataset.formBound = '1';

  ['nova-servico', 'novo-tipo', 'novo-pagamento'].forEach((id) =>
    document.getElementById(id)?.addEventListener('change', syncEscalaSubmitState),
  );
  document.getElementById('nova-data')?.addEventListener('change', syncEscalaSubmitState);
  document.getElementById('nova-data')?.addEventListener('input', syncEscalaSubmitState);
}

export function syncEscalaSubmitState() {
  const btn = document.getElementById('btn-submit-escala');
  if (!btn || escalaSubmitting) return;
  primeSubmitButton('btn-submit-escala');

  const ok =
    !!document.getElementById('nova-servico')?.value?.trim() &&
    !!document.getElementById('novo-tipo')?.value?.trim() &&
    !!document.getElementById('novo-pagamento')?.value?.trim() &&
    !!document.getElementById('nova-data')?.value?.trim() &&
    store.escalaMilitares.length >= 1 &&
    store.allOperacoes.length > 0;

  btn.disabled = !ok;
}

function isEscalaFormComplete() {
  return !!(
    document.getElementById('nova-servico')?.value?.trim() &&
    document.getElementById('novo-tipo')?.value?.trim() &&
    document.getElementById('novo-pagamento')?.value?.trim() &&
    document.getElementById('nova-data')?.value?.trim() &&
    store.escalaMilitares.length >= 1
  );
}

export function openEscalaModal() {
  escalaSubmitting = false;
  document.getElementById('escala-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  store.escalaMilitares = [];
  primeSubmitButton('btn-submit-escala');
  preencherSelectsEscala();
  renderEscalaLista();
  bindEscalaFormValidationOnce();
  setModalSaving('escala-modal-overlay', 'btn-submit-escala', false);
  syncEscalaSubmitState();
}

export function closeEscalaModal() {
  escalaSubmitting = false;
  setModalSaving('escala-modal-overlay', 'btn-submit-escala', false);
  syncEscalaSubmitState();
  document.getElementById('escala-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function preencherSelectsEscala() {
  const servicoSel = document.getElementById('nova-servico');
  servicoSel.innerHTML = store.allOperacoes
    .map((o) => `<option value="${o['SERVIÇO']}">${o['SERVIÇO']}</option>`)
    .join('');

  const tipos = [...new Set(store.allOperacoes.map((o) => o['TIPO']).filter(Boolean))];
  document.getElementById('novo-tipo').innerHTML =
    tipos.map((t) => `<option value="${t}">${t}</option>`).join('');

  const militarSel = document.getElementById('militar-select');
  militarSel.innerHTML = store.allMilitares
    .sort((a, b) => Number(a['ORD']) - Number(b['ORD']))
    .map((m) => `<option value="${m['ORD']}">${m['NOME'] || m['MILITAR']}</option>`)
    .join('');
}

export function addMilitarEscala() {
  const select = document.getElementById('militar-select');
  const ord = select.value;
  const militar = store.allMilitares.find((m) => String(m['ORD']) === String(ord));
  if (!militar) return;
  const nome = militar['NOME'] || militar['MILITAR'];
  if (store.escalaMilitares.some((m) => m.ord === ord)) {
    alert('Militar já adicionado.');
    return;
  }
  store.escalaMilitares.push({ ord, nome });
  renderEscalaLista();
}

export function removeMilitarEscala(ord) {
  store.escalaMilitares = store.escalaMilitares.filter((m) => m.ord !== ord);
  renderEscalaLista();
}

function renderEscalaLista() {
  const lista = document.getElementById('escala-lista');
  if (!store.escalaMilitares.length) {
    lista.innerHTML =
      '<span style="color:var(--muted);font-size:13px">Nenhum militar adicionado.</span>';
  } else {
    lista.innerHTML = store.escalaMilitares
      .map(
        (m) => `
    <div class="escala-tag">
      ${m.nome}
      <button type="button" onclick="removeMilitarEscala('${m.ord}')">✕</button>
    </div>
  `,
      )
      .join('');
  }
  syncEscalaSubmitState();
}

export async function enviarEscala() {
  if (!isEscalaFormComplete() || escalaSubmitting) return;

  const servico = document.getElementById('nova-servico').value;
  const tipo = document.getElementById('novo-tipo').value;
  const pagamento = document.getElementById('novo-pagamento').value;
  const data = document.getElementById('nova-data').value;
  const obs = document.getElementById('nova-obs').value;

  const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  const mes = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' });

  const registros = store.escalaMilitares.map((m) => ({
    data: dataFormatada,
    numero: m.ord,
    militar: m.nome,
    servico,
    tipo,
    pagamento,
    obs,
    mes,
  }));

  escalaSubmitting = true;
  setModalSaving('escala-modal-overlay', 'btn-submit-escala', true);

  try {
    await postNovaEscala({ action: 'nova_escala', registros });
    alert('Escala registrada com sucesso!');
    closeEscalaModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao enviar dados.');
  } finally {
    escalaSubmitting = false;
    setModalSaving('escala-modal-overlay', 'btn-submit-escala', false);
    syncEscalaSubmitState();
  }
}

// ─── Novo militar ──────────────────────────────────────────────

function bindMilitarFormValidationOnce() {
  const root = document.getElementById('militar-modal-overlay');
  if (!root || root.dataset.formBound === '1') return;
  root.dataset.formBound = '1';
  ['novo-mil-ord', 'novo-mil-completo', 'novo-mil-nome', 'novo-mil-cargo'].forEach((id) =>
    document.getElementById(id)?.addEventListener('input', syncMilitarSubmitState),
  );
}

export function syncMilitarSubmitState() {
  const btn = document.getElementById('btn-submit-militar');
  if (!btn || militarSubmitting) return;
  primeSubmitButton('btn-submit-militar');

  const ord = document.getElementById('novo-mil-ord')?.value?.trim();
  const mil = document.getElementById('novo-mil-completo')?.value?.trim();
  const nome = document.getElementById('novo-mil-nome')?.value?.trim();
  const cargo = document.getElementById('novo-mil-cargo')?.value?.trim();

  btn.disabled = !(ord && mil && nome && cargo);
}

function isMilitarFormComplete() {
  const ord = document.getElementById('novo-mil-ord')?.value?.trim();
  const militar = document.getElementById('novo-mil-completo')?.value?.trim();
  const nome = document.getElementById('novo-mil-nome')?.value?.trim();
  const cargo = document.getElementById('novo-mil-cargo')?.value?.trim();
  return !!(ord && militar && nome && cargo);
}

export function openMilitarModal() {
  militarSubmitting = false;
  document.getElementById('militar-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  primeSubmitButton('btn-submit-militar');
  bindMilitarFormValidationOnce();
  setModalSaving('militar-modal-overlay', 'btn-submit-militar', false);
  syncMilitarSubmitState();
}

export function closeMilitarModal() {
  militarSubmitting = false;
  setModalSaving('militar-modal-overlay', 'btn-submit-militar', false);
  syncMilitarSubmitState();
  document.getElementById('militar-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export async function salvarMilitar() {
  if (!isMilitarFormComplete() || militarSubmitting) return;

  const ord = document.getElementById('novo-mil-ord').value.trim();
  const militar = document.getElementById('novo-mil-completo').value.trim();
  const nome = document.getElementById('novo-mil-nome').value.trim();
  const cargo = document.getElementById('novo-mil-cargo').value.trim();

  militarSubmitting = true;
  setModalSaving('militar-modal-overlay', 'btn-submit-militar', true);

  try {
    await postNovoMilitar({
      action: 'novo_militar',
      ord,
      militar,
      nome,
      cargo,
    });
    alert('Militar cadastrado!');
    closeMilitarModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao cadastrar.');
  } finally {
    militarSubmitting = false;
    setModalSaving('militar-modal-overlay', 'btn-submit-militar', false);
    syncMilitarSubmitState();
  }
}

// ─── Nova operação ─────────────────────────────────────────────

function bindOperacaoFormValidationOnce() {
  const root = document.getElementById('operacao-modal-overlay');
  if (!root || root.dataset.formBound === '1') return;
  root.dataset.formBound = '1';
  document.getElementById('nova-operacao-nome')?.addEventListener('input', syncOperacaoSubmitState);
  document.getElementById('nova-operacao-tipo')?.addEventListener('change', syncOperacaoSubmitState);
}

export function syncOperacaoSubmitState() {
  const btn = document.getElementById('btn-submit-operacao');
  if (!btn || operacaoSubmitting) return;
  primeSubmitButton('btn-submit-operacao');

  btn.disabled = !document.getElementById('nova-operacao-nome')?.value?.trim();
}

function isOperacaoFormComplete() {
  return !!document.getElementById('nova-operacao-nome')?.value?.trim();
}

export function openOperacaoModal() {
  operacaoSubmitting = false;
  document.getElementById('operacao-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  primeSubmitButton('btn-submit-operacao');
  bindOperacaoFormValidationOnce();
  setModalSaving('operacao-modal-overlay', 'btn-submit-operacao', false);
  syncOperacaoSubmitState();
}

export function closeOperacaoModal() {
  operacaoSubmitting = false;
  setModalSaving('operacao-modal-overlay', 'btn-submit-operacao', false);
  syncOperacaoSubmitState();
  document.getElementById('operacao-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export async function salvarOperacao() {
  if (!isOperacaoFormComplete() || operacaoSubmitting) return;

  const servico = document.getElementById('nova-operacao-nome').value.trim();
  const tipo = document.getElementById('nova-operacao-tipo').value;

  operacaoSubmitting = true;
  setModalSaving('operacao-modal-overlay', 'btn-submit-operacao', true);

  try {
    await postNovaOperacao({ action: 'nova_operacao', servico, tipo });
    alert('Operação cadastrada!');
    closeOperacaoModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao cadastrar.');
  } finally {
    operacaoSubmitting = false;
    setModalSaving('operacao-modal-overlay', 'btn-submit-operacao', false);
    syncOperacaoSubmitState();
  }
}
