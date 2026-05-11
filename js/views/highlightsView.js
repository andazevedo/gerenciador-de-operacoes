import { store } from '../state/store.js';
import { uniq, sortMes, cap } from '../utils/text.js';

export function renderHighlights() {
  const meses = sortMes(uniq(store.filtered.map((r) => r['MÊS'])).filter(Boolean));
  const grid = document.getElementById('highlight-grid');
  if (!meses.length) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = meses
    .map((mes) => {
      const rows = store.filtered.filter(
        (r) => (r['MÊS'] || '').toLowerCase() === mes.toLowerCase(),
      );
      const counts = {};
      rows.forEach((r) => {
        const m = r['MILITAR'] || '?';
        counts[m] = (counts[m] || 0) + 1;
      });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!top) return '';
      const [nome, qtd] = top;
      const apelido = nome.split(' ').pop();
      const milEntry = store.allMilitares.find(
        (m) => (m['MILITAR'] || m['NOME'] || '') === nome,
      );
      const cargo = milEntry ? milEntry['CARGO'] || '' : '';
      return `
      <div class="highlight-card">
        <div class="highlight-rank">🏆</div>
        <div class="highlight-info">
          <div class="name">${apelido}</div>
          ${cargo ? `<div style="font-size:11px;color:var(--accent2);font-family:'Rajdhani',sans-serif;font-weight:700;letter-spacing:.5px;margin-top:1px">${cargo}</div>` : ''}
          <div class="count">${qtd} participação${qtd > 1 ? 's' : ''}</div>
          <div class="mes">${cap(mes)}</div>
        </div>
      </div>`;
    })
    .join('');
}
