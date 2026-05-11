import { store } from '../state/store.js';

export function toggleRanking() {
  store.rankingOpen = !store.rankingOpen;
  document.getElementById('ranking-content').style.display = store.rankingOpen ? '' : 'none';
  document.getElementById('ranking-hint').style.display = store.rankingOpen ? '' : 'none';
  document.getElementById('ranking-toggle-btn').textContent = store.rankingOpen
    ? '▲ Recolher'
    : '▼ Expandir';
}

export function setRankSort(col) {
  store.rankSortDir =
    store.rankSortCol === col ? (store.rankSortDir === 'asc' ? 'desc' : 'asc') : 'desc';
  store.rankSortCol = col;
  renderRanking();
}

export function renderRanking() {
  const milMap = {};
  store.allMilitares.forEach((r) => {
    const ord = String(r['ORD'] || '').trim();
    if (ord) milMap[ord] = { nome: r['NOME'] || r['MILITAR'] || '', cargo: r['CARGO'] || '' };
  });

  const militares = Object.entries(milMap).map(([ord, m]) => ({ ord, ...m }));

  const rows = militares.filter((m) => m.nome).map((m) => {
    const regs = store.filtered.filter(
      (r) => String(r['Nº MILITAR'] || '').trim() === m.ord,
    );
    const regsExtra = regs.filter((r) => (r['TIPO'] || '').toUpperCase() === 'EXTRA');
    const regsOp = regs.filter((r) => (r['TIPO'] || '').toUpperCase() === 'OPERAÇÃO');
    const extras = regsExtra.length;
    const extrasUniq = new Set(regsExtra.map((r) => r['SERVIÇO'] || '')).size;
    const ops = regsOp.length;
    const opsUniq = new Set(regsOp.map((r) => r['SERVIÇO'] || '')).size;
    const total = regs.length;
    const antiguidade = Number(m.ord);
    return { ...m, extras, extrasUniq, ops, opsUniq, total, antiguidade };
  });

  console.log(
    '🏅 Ranking rows sample:',
    rows.slice(0, 3).map((r) => ({
      ord: r.ord,
      nome: r.nome,
      cargo: r.cargo,
      total: r.total,
      antiguidade: r.antiguidade,
    })),
  );

  const rs = store.rankSortCol;
  const rd = store.rankSortDir;
  rows.sort((a, b) => {
    const va = a[rs],
      vb = b[rs];
    if (typeof va === 'string')
      return rd === 'asc' ? va.localeCompare(vb, 'pt') : vb.localeCompare(va, 'pt');
    return rd === 'asc' ? va - vb : vb - va;
  });

  const maxTotal = Math.max(...rows.map((r) => r.total), 1);
  const maxExtras = Math.max(...rows.map((r) => r.extras), 1);
  const maxOps = Math.max(...rows.map((r) => r.ops), 1);

  const RCOLS = [
    { key: 'rank', label: '#' },
    { key: 'antiguidade', label: 'Ant.' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'nome', label: 'Nome' },
    { key: 'total', label: 'Total' },
    { key: 'extras', label: 'Extras' },
    { key: 'ops', label: 'Operações' },
  ];

  const arrow = (col) => {
    if (col === 'rank') return '';
    if (store.rankSortCol === col)
      return `<span class="arrow">${store.rankSortDir === 'asc' ? '↑' : '↓'}</span>`;
    return `<span class="arrow">↕</span>`;
  };

  document.getElementById('ranking-head').innerHTML = RCOLS.map((col) => {
    if (col.key === 'rank')
      return `<th style="padding:11px 14px;text-align:center;font-family:Rajdhani,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);width:40px">#</th>`;
    const sorted = store.rankSortCol === col.key;
    return `<th onclick="setRankSort('${col.key}')" style="padding:11px 14px;text-align:left;font-family:Rajdhani,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${sorted ? 'var(--text)' : 'var(--muted)'};white-space:nowrap;cursor:pointer;user-select:none">
      ${col.label} ${arrow(col.key)}</th>`;
  }).join('');

  document.getElementById('ranking-body').innerHTML = rows
    .map((r, i) => {
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const nomeCompleto = r.nome;
      const apelido = r.nome;

      const ordEsc = r.ord.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      const totalBar = `<div class="rank-bar-wrap"><div class="rank-bar" style="width:${r.total ? Math.round((r.total / maxTotal) * 100) : 0}%"></div></div>`;
      const extrasBar = `<div class="rank-bar-wrap"><div class="rank-bar" style="width:${r.extras ? Math.round((r.extras / maxExtras) * 100) : 0}%"></div></div>`;
      const opsBar = `<div class="rank-bar-wrap"><div class="rank-bar green" style="width:${r.ops ? Math.round((r.ops / maxOps) * 100) : 0}%"></div></div>`;

      return `<tr style="border-bottom:1px solid var(--border);transition:background .1s;cursor:pointer" onclick="openModal('${ordEsc}')" onmouseover="this.style.background='rgba(224,92,0,.05)'" onmouseout="this.style.background=''">
      <td style="padding:10px 14px;text-align:center"><span class="rank-num ${rankClass}">${rankLabel}</span></td>
      <td style="padding:10px 14px;text-align:center;color:var(--muted);font-family:Rajdhani,sans-serif;font-size:13px;font-weight:600">${r.antiguidade}º</td>
      <td style="padding:10px 14px;color:var(--muted);white-space:nowrap;font-size:12px">${r.cargo}</td>
      <td style="padding:10px 14px;white-space:nowrap" title="${nomeCompleto}"><strong>${apelido}</strong></td>
      <td style="padding:10px 14px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:Rajdhani,sans-serif;font-size:15px;font-weight:700;color:${r.total ? 'var(--text)' : 'var(--border)'};min-width:24px">${r.total || '—'}</span>
          ${totalBar}
        </div>
      </td>
      <td style="padding:10px 14px">
        <div style="display:flex;align-items:center;gap:8px">
          <div>
            <div style="font-family:Rajdhani,sans-serif;font-size:15px;font-weight:700;color:${r.extras ? 'var(--accent2)' : 'var(--border)'}">${r.extras || '—'}</div>
            ${r.extras ? `<div style="font-size:11px;color:var(--muted)">${r.extrasUniq} distinta${r.extrasUniq !== 1 ? 's' : ''}</div>` : ''}
          </div>
          ${extrasBar}
        </div>
      </td>
      <td style="padding:10px 14px">
        <div style="display:flex;align-items:center;gap:8px">
          <div>
            <div style="font-family:Rajdhani,sans-serif;font-size:15px;font-weight:700;color:${r.ops ? 'var(--green)' : 'var(--border)'}">${r.ops || '—'}</div>
            ${r.ops ? `<div style="font-size:11px;color:var(--muted)">${r.opsUniq} distinta${r.opsUniq !== 1 ? 's' : ''}</div>` : ''}
          </div>
          ${opsBar}
        </div>
      </td>
    </tr>`;
    })
    .join('');
}
