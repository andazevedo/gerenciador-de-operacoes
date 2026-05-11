import { PERM_AUT_COTA_MENSAL, URL_PERM_AUT } from '../config.js';
import { store } from '../state/store.js';
import { cap, formatData, sortMes, uniq } from '../utils/text.js';
import { paNomeMilitar, paRowNumMil } from '../utils/permutaAutHelpers.js';

/** Contagens por militar + mês + ano (dataset completo) para regra de cota */
function buildQuotaCountMap(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const ord = paRowNumMil(row);
    const mes = String(row['MÊS'] ?? '').trim().toLowerCase();
    const ano = String(row['ANO'] ?? '').trim();
    if (!ord || !mes || !ano) return;
    const k = `${ord}|${mes}|${ano}`;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return map;
}

function countExceedsCota(countMap, row) {
  const ord = paRowNumMil(row);
  const mes = String(row['MÊS'] ?? '').trim().toLowerCase();
  const ano = String(row['ANO'] ?? '').trim();
  if (!ord || !mes || !ano) return false;
  const n = countMap.get(`${ord}|${mes}|${ano}`) || 0;
  return n > PERM_AUT_COTA_MENSAL;
}

function getFilteredPermAutRows() {
  let rows = [...store.allPermAut];
  const ordSel = document.getElementById('f-pa-militar')?.value ?? '';
  const ano = document.getElementById('f-pa-ano')?.value ?? '';
  const mes = document.getElementById('f-pa-mes')?.value ?? '';
  const tipo = document.getElementById('f-pa-tipo')?.value ?? '';

  if (ordSel) rows = rows.filter((r) => paRowNumMil(r) === ordSel);
  if (ano) rows = rows.filter((r) => String(r['ANO'] ?? '').trim() === ano);
  if (mes) {
    rows = rows.filter(
      (r) => String(r['MÊS'] ?? '').trim().toLowerCase() === mes.toLowerCase(),
    );
  }
  if (tipo) {
    rows = rows.filter(
      (r) => String(r['TIPO'] ?? '').trim().toUpperCase() === tipo.toUpperCase(),
    );
  }
  return rows.sort((a, b) => {
    const da = new Date(a['DATA'] || '');
    const db = new Date(b['DATA'] || '');
    if (isNaN(da) && isNaN(db)) return 0;
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return db - da;
  });
}

function rebuildPermAutFilters() {
  const selMil = document.getElementById('f-pa-militar');
  const selAno = document.getElementById('f-pa-ano');
  const selMes = document.getElementById('f-pa-mes');
  if (!selMil || !selAno || !selMes) return;

  const curM = selMil.value;
  const curA = selAno.value;
  const curMes = selMes.value;

  const nums = uniq(store.allPermAut.map((r) => paRowNumMil(r)).filter(Boolean)).sort(
    (a, b) => Number(a) - Number(b),
  );
  selMil.innerHTML =
    '<option value="">Todos</option>' +
    nums
      .map((n) => {
        const nome = paNomeMilitar(n, store.allMilitares);
        const label = nome ? `${nome} (nº ${n})` : `nº ${n}`;
        return `<option value="${n}">${label}</option>`;
      })
      .join('');

  const anos = uniq(
    store.allPermAut.map((r) => String(r['ANO'] ?? '').trim()).filter(Boolean),
  ).sort((a, b) => String(b).localeCompare(String(a), 'pt'));
  selAno.innerHTML =
    '<option value="">Todos</option>' +
    anos.map((a) => `<option value="${a}">${a}</option>`).join('');

  const meses = sortMes(
    uniq(store.allPermAut.map((r) => String(r['MÊS'] ?? '').trim()).filter(Boolean)),
  );
  selMes.innerHTML =
    '<option value="">Todos</option>' +
    meses.map((m) => `<option value="${m}">${cap(m)}</option>`).join('');

  if (curM && [...selMil.options].some((o) => o.value === curM)) selMil.value = curM;
  if (curA && [...selAno.options].some((o) => o.value === curA)) selAno.value = curA;
  if (curMes && [...selMes.options].some((o) => o.value === curMes)) selMes.value = curMes;
}

function renderPermAutDash(filteredRows) {
  const el = document.getElementById('perm-aut-dash');
  if (!el) return;

  const byOrd = new Map();
  filteredRows.forEach((row) => {
    const ord = paRowNumMil(row);
    if (!ord) return;
    const nome = paNomeMilitar(ord, store.allMilitares) || ord;
    const t = String(row['TIPO'] ?? '').toUpperCase();
    if (!byOrd.has(ord)) {
      byOrd.set(ord, { nome, ord, perm: 0, aut: 0, total: 0 });
    }
    const o = byOrd.get(ord);
    o.total++;
    if (t.includes('PERMUT')) o.perm++;
    else if (t.includes('AUTOR')) o.aut++;
    else o.perm++;
  });

  const top = [...byOrd.values()].sort((a, b) => b.total - a.total).slice(0, 8);

  if (!top.length) {
    el.innerHTML =
      '<p style="color:var(--muted);font-size:13px;padding:8px 0">Nenhum registro com os filtros atuais.</p>';
    return;
  }

  el.innerHTML = `
    <div class="perm-aut-dash-grid">
      ${top
        .map(
          (r) => `
        <div class="perm-aut-dash-card">
          <div class="perm-aut-dash-name">${r.nome}</div>
          <div class="perm-aut-dash-meta">
            <span title="Permutas">${r.perm} perm.</span>
            <span class="perm-aut-dash-sep">·</span>
            <span title="Autorizações">${r.aut} aut.</span>
            <span class="perm-aut-dash-sep">·</span>
            <strong>${r.total}</strong> total
          </div>
        </div>`,
        )
        .join('')}
    </div>`;
}

function renderPermAutTable(filteredRows, quotaMap) {
  const wrap = document.getElementById('perm-aut-table-body');
  if (!wrap) return;

  if (URL_PERM_AUT.includes('SUBSTITUIR_GID_PERM_AUT')) {
    wrap.innerHTML = `<div class="state-box" style="padding:28px">
      <p style="font-size:14px">Configure a URL da aba <strong>PERM E AUT</strong> em <code>public/js/config.js</code> (substitua <code>SUBSTITUIR_GID_PERM_AUT</code> pelo gid da aba).</p>
    </div>`;
    return;
  }

  if (!filteredRows.length) {
    wrap.innerHTML = `<div class="state-box" style="padding:28px"><p>Nenhum registro de permuta/autorização com estes filtros.</p></div>`;
    return;
  }

  let html = `<div class="table-scroll"><table><thead><tr>
    <th>Data</th><th>Nº</th><th>Militar</th><th>Mês</th><th>Ano</th><th>Tipo</th><th>Detalhe</th><th>Obs</th><th>Cota</th>
  </tr></thead><tbody>`;

  filteredRows.forEach((row) => {
    const ord = paRowNumMil(row);
    const nome = paNomeMilitar(ord, store.allMilitares) || '—';
    const over = countExceedsCota(quotaMap, row);
    const trClass = over ? ' class="row-quota-warn"' : '';
    const cotaCell = over
      ? `<span class="badge badge-quota" title="Mais de ${PERM_AUT_COTA_MENSAL} trocas neste mês">Acima da cota</span>`
      : `<span class="muted">—</span>`;
    html += `<tr${trClass}>
      <td class="muted">${formatData(row['DATA'])}</td>
      <td class="muted">${ord}</td>
      <td><strong>${nome}</strong></td>
      <td class="muted">${cap(String(row['MÊS'] ?? '').trim())}</td>
      <td class="muted">${row['ANO'] ?? ''}</td>
      <td>${String(row['TIPO'] ?? '')}</td>
      <td>${row['DETALHE'] ?? '—'}</td>
      <td class="muted">${row['OBS'] ?? '—'}</td>
      <td>${cotaCell}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

export function applyPermAutFilters() {
  renderPermAutAll();
}

export function renderPermAutAll() {
  rebuildPermAutFilters();
  const filtered = getFilteredPermAutRows();
  const quotaMap = buildQuotaCountMap(store.allPermAut);
  const qc = document.getElementById('perm-aut-count');
  if (qc) qc.textContent = `${filtered.length} registro(s)`;
  renderPermAutDash(filtered);
  renderPermAutTable(filtered, quotaMap);
}
