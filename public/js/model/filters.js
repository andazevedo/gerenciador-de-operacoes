import { store } from '../state/store.js';
import { uniq, sortMes, cap } from '../utils/text.js';
import { renderDashboard } from '../views/dashboardView.js';
import { renderChart } from '../views/chartView.js';
import { renderHighlights } from '../views/highlightsView.js';
import { renderRanking } from '../views/rankingView.js';
import { renderTable } from '../views/tableView.js';
import { renderPermAutAll } from '../views/permutaAutView.js';

function fillSelect(id, values, useCap) {
  const sel = document.getElementById(id);
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todos</option>';
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = useCap ? cap(v) : v;
    sel.appendChild(opt);
  });
  if (cur) sel.value = cur;
}

export function buildFilters() {
  const milOrdenados = store.allMilitares
    .slice()
    .sort((a, b) => Number(a['ORD'] || 0) - Number(b['ORD'] || 0))
    .map((r) => r['MILITAR'] || r['NOME'] || '')
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
  fillSelect('f-militar', milOrdenados, false);

  const anos = uniq(
    store.allData.map((r) => {
      const raw = r['DATA'] || '';
      const d = new Date(raw);
      return isNaN(d) ? raw.slice(0, 4) : String(d.getFullYear());
    }),
  )
    .filter((a) => a.length === 4)
    .sort()
    .reverse();
  fillSelect('f-ano', anos, false);

  fillSelect('f-mes', sortMes(uniq(store.allData.map((r) => r['MÊS']))), true);
  fillSelect('f-tipo', uniq(store.allOperacoes.map((r) => r['TIPO'])).sort(), false);

  const servicos = store.allOperacoes.map((r) => r['SERVIÇO']).filter(Boolean).sort();
  fillSelect('f-servico', servicos, false);

  fillSelect('f-pagamento', uniq(store.allData.map((r) => r['PAGAMENTO'])).sort(), false);
}

export function resetFilters() {
  ['f-militar', 'f-ano', 'f-mes', 'f-tipo', 'f-servico', 'f-pagamento'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('clear-btn-wrap').innerHTML = '';
}

/** Usado pelo botão “Limpar filtros” no HTML (`onclick`). */
export function resetFiltersRebuildAndApply() {
  resetFilters();
  buildFilters();
  applyFilters();
}

export function applyFilters() {
  const mil = document.getElementById('f-militar').value;
  const ano = document.getElementById('f-ano').value;
  const mes = document.getElementById('f-mes').value;
  const tipo = document.getElementById('f-tipo').value;
  const svc = document.getElementById('f-servico').value;
  const pag = document.getElementById('f-pagamento').value;

  store.filtered = store.allData.filter((r) => {
    if (mil && r['MILITAR'] !== mil) return false;
    if (ano) {
      const d = new Date(r['DATA'] || '');
      if (isNaN(d) || String(d.getFullYear()) !== ano) return false;
    }
    if (mes && (r['MÊS'] || '').toLowerCase() !== mes.toLowerCase()) return false;
    if (tipo && (r['TIPO'] || '').toUpperCase() !== tipo.toUpperCase()) return false;
    if (svc && r['SERVIÇO'] !== svc) return false;
    if (pag && r['PAGAMENTO'] !== pag) return false;
    return true;
  });

  const wrap = document.getElementById('clear-btn-wrap');
  wrap.innerHTML =
    mil || ano || mes || tipo || svc || pag
      ? `<button class="btn-ghost" onclick="resetFiltersRebuildAndApply()">✕ Limpar filtros</button>`
      : '';

  store.currentPage = 1;
  renderDashboard();
  renderChart();
  renderHighlights();
  renderRanking();
  renderTable();
  renderPermAutAll();
}
