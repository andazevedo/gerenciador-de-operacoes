import { store } from '../state/store.js';
import { uniq } from '../utils/text.js';

export function renderDashboard() {
  const filtered = store.filtered;

  const total = filtered.length;
  const operacoesUnicas = uniq(
    filtered
      .filter((r) => (r['TIPO'] || '').toUpperCase() === 'OPERAÇÃO')
      .map((r) => r['SERVIÇO']),
  ).length;

  const extrasUnicas = uniq(
    filtered
      .filter((r) => (r['TIPO'] || '').toUpperCase() === 'EXTRA')
      .map((r) => r['SERVIÇO']),
  ).length;

  const escalados = uniq(filtered.map((r) => r['MILITAR'])).length;
  const totalMil = store.allMilitares.length;

  document.getElementById('d-total').textContent = total;
  document.getElementById('d-operacoes').textContent = operacoesUnicas;
  document.getElementById('d-extras').textContent = extrasUnicas;
  document.getElementById('d-escalados').textContent = escalados;
  document.getElementById('d-total-mil').textContent = totalMil;

  document.getElementById('d-operacoes-sub').textContent =
    operacoesUnicas === 1 ? '1 operação distinta' : operacoesUnicas + ' operações distintas';
  document.getElementById('d-extras-sub').textContent =
    extrasUnicas === 1 ? '1 serviço extra distinto' : extrasUnicas + ' serviços extras distintos';
}
