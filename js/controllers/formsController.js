import { store } from '../state/store.js';
import { postNovaEscala, postNovoMilitar, postNovaOperacao } from '../services/appsScriptApi.js';

export function openEscalaModal() {
  document.getElementById('escala-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  store.escalaMilitares = [];
  preencherSelectsEscala();
  renderEscalaLista();
}

export function closeEscalaModal() {
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
    .map(
      (m) =>
        `<option value="${m['ORD']}">${m['NOME'] || m['MILITAR']}</option>`,
    )
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
    return;
  }
  lista.innerHTML = store.escalaMilitares
    .map(
      (m) => `
    <div class="escala-tag">
      ${m.nome}
      <button onclick="removeMilitarEscala('${m.ord}')">✕</button>
    </div>
  `,
    )
    .join('');
}

export async function enviarEscala() {
  if (!store.escalaMilitares.length) {
    alert('Adicione pelo menos 1 militar.');
    return;
  }
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

  try {
    await postNovaEscala({ action: 'nova_escala', registros });
    alert('Escala registrada com sucesso!');
    closeEscalaModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao enviar dados.');
  }
}

export function openMilitarModal() {
  document.getElementById('militar-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeMilitarModal() {
  document.getElementById('militar-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export async function salvarMilitar() {
  const ord = document.getElementById('novo-mil-ord').value;
  const militar = document.getElementById('novo-mil-completo').value;
  const nome = document.getElementById('novo-mil-nome').value;
  const cargo = document.getElementById('novo-mil-cargo').value;
  if (!ord || !militar || !nome || !cargo) {
    alert('Preencha todos os campos.');
    return;
  }
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
  }
}

export function openOperacaoModal() {
  document.getElementById('operacao-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeOperacaoModal() {
  document.getElementById('operacao-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export async function salvarOperacao() {
  const servico = document.getElementById('nova-operacao-nome').value;
  const tipo = document.getElementById('nova-operacao-tipo').value;
  if (!servico) {
    alert('Digite o serviço.');
    return;
  }
  try {
    await postNovaOperacao({ action: 'nova_operacao', servico, tipo });
    alert('Operação cadastrada!');
    closeOperacaoModal();
  } catch (err) {
    console.error(err);
    alert('Erro ao cadastrar.');
  }
}
