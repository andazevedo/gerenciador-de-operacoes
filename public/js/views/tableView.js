import { PER_PAGE, TABLE_COLS } from '../config.js';
import { store } from '../state/store.js';
import { formatData } from '../utils/text.js';

function sortData() {
  const sc = store.sortCol;
  const sd = store.sortDir;
  return [...store.filtered].sort((a, b) => {
    let va = a[sc] || '',
      vb = b[sc] || '';
    if (sc === 'DATA') {
      va = new Date(va);
      vb = new Date(vb);
    } else if (sc === 'Nº MILITAR') {
      va = Number(va);
      vb = Number(vb);
    } else {
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
    }
    if (va < vb) return sd === 'asc' ? -1 : 1;
    if (va > vb) return sd === 'asc' ? 1 : -1;
    return 0;
  });
}

export function setSort(col) {
  store.sortDir = store.sortCol === col ? (store.sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
  store.sortCol = col;
  renderTable();
}

export function renderTable() {
  const sorted = sortData();
  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  if (store.currentPage > totalPages) store.currentPage = totalPages;
  const pageData = sorted.slice(
    (store.currentPage - 1) * PER_PAGE,
    store.currentPage * PER_PAGE,
  );

  document.getElementById('table-count').innerHTML =
    `Exibindo <strong>${sorted.length}</strong> de <strong>${store.allData.length}</strong> registros`;

  const arrow = (col) =>
    store.sortCol === col
      ? `<span class="arrow">${store.sortDir === 'asc' ? '↑' : '↓'}</span>`
      : `<span class="arrow">↕</span>`;

  let html = '';
  if (pageData.length === 0) {
    html =
      store.allData.length === 0
        ? `<div class="state-box"><div class="icon">📋</div><p>Carregando dados da planilha...</p></div>`
        : `<div class="state-box"><div class="icon">🔍</div><p>Nenhum registro encontrado com os filtros selecionados.</p></div>`;
  } else {
    html += `<div class="table-scroll"><table><thead><tr>`;
    TABLE_COLS.forEach((c) => {
      html += `<th class="${store.sortCol === c.key ? 'sorted' : ''}" onclick="setSort('${c.key}')">${c.label} ${arrow(c.key)}</th>`;
    });
    html += `</tr></thead><tbody>`;
    pageData.forEach((row) => {
      const pag = row['PAGAMENTO'] || '';
      const tipo = (row['TIPO'] || '').toUpperCase();
      const tipoBadge =
        tipo === 'OPERAÇÃO'
          ? `<span class="badge badge-operacao">OPERAÇÃO</span>`
          : `<span class="badge badge-extra">EXTRA</span>`;
      const pagBadge =
        pag === 'Extra'
          ? `<span class="badge badge-extra">${pag}</span>`
          : `<span class="badge badge-diaria">${pag}</span>`;
      html += `<tr>
        <td class="muted">${formatData(row['DATA'])}</td>
        <td class="muted">${row['Nº MILITAR'] || ''}</td>
        <td><strong>${row['MILITAR'] || ''}</strong></td>
        <td>${row['SERVIÇO'] || ''}</td>
        <td>${tipoBadge}</td>
        <td>${pagBadge}</td>
        <td class="muted">${row['OBS'] || '—'}</td>
        <td class="muted" style="font-style:italic">${row['MÊS'] || ''}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }
  document.getElementById('table-body').innerHTML = html;

  let pg = '';
  const cp = store.currentPage;
  if (totalPages > 1) {
    pg += `<button class="page-btn" onclick="goPage(${cp - 1})" ${cp === 1 ? 'disabled' : ''}>‹</button>`;
    let dots = false;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - cp) <= 2) {
        pg += `<button class="page-btn ${i === cp ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
        dots = false;
      } else if (!dots) {
        pg += `<span class="page-info">…</span>`;
        dots = true;
      }
    }
    pg += `<button class="page-btn" onclick="goPage(${cp + 1})" ${cp === totalPages ? 'disabled' : ''}>›</button>`;
    pg += `<span class="page-info">pág. ${cp} / ${totalPages}</span>`;
  }
  document.getElementById('pagination').innerHTML = pg;
}

export function goPage(p) {
  store.currentPage = p;
  renderTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
