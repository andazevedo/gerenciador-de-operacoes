import { store } from '../state/store.js';
import { cap, sortMes } from '../utils/text.js';

export function renderChart() {
  const counts = {};
  store.filtered.forEach((r) => {
    const m = r['MÊS'] || 'Sem mês';
    counts[m] = (counts[m] || 0) + 1;
  });
  const months = sortMes(Object.keys(counts));
  const max = Math.max(...Object.values(counts), 1);

  document.getElementById('chart-bars').innerHTML = months.length
    ? months
        .map(
          (mes) => `
        <div class="bar-col">
          <span class="bar-val">${counts[mes]}</span>
          <div class="bar" style="height:${Math.max(4, (counts[mes] / max) * 130)}px"></div>
          <span class="bar-label">${cap(mes)}</span>
        </div>`,
        )
        .join('')
    : '';
}
