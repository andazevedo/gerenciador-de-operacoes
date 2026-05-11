import { store } from '../state/store.js';
import { cap, formatData, sortMes } from '../utils/text.js';

export function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}

export function closeModalBtn() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

export function openModal(ord) {
  store.modalOrd = ord;
  const lookup = {};
  store.allMilitares.forEach((r) => {
    const o = String(r['ORD'] || '').trim();
    if (o) lookup[o] = { nome: r['NOME'] || r['MILITAR'] || '', cargo: r['CARGO'] || '' };
  });
  const mil = lookup[ord];
  const nome = mil ? mil.nome : ord;
  const cargo = mil ? mil.cargo : '';
  document.getElementById('modal-nome').textContent = nome;
  document.getElementById('modal-cargo').textContent = cargo;
  renderModalBody(ord, '');
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function renderModalBody(ord, mesFiltro) {
  const regs = store.allData.filter((r) => String(r['Nº MILITAR'] || '').trim() === ord);
  const meses = sortMes([...new Set(regs.map((r) => r['MÊS'] || '').filter(Boolean))]);
  const regsFiltered = mesFiltro
    ? regs.filter((r) => (r['MÊS'] || '').toLowerCase() === mesFiltro.toLowerCase())
    : regs;

  const mesCards = meses
    .map((mes) => {
      const rm = regs.filter((r) => (r['MÊS'] || '').toLowerCase() === mes.toLowerCase());
      const extras = rm.filter((r) => (r['TIPO'] || '').toUpperCase() === 'EXTRA').length;
      const ops = rm.filter((r) => (r['TIPO'] || '').toUpperCase() === 'OPERAÇÃO').length;
      const diarias = rm.filter((r) => (r['PAGAMENTO'] || '').toLowerCase() === 'diária').length;
      const extrasP = rm.filter((r) => (r['PAGAMENTO'] || '').toLowerCase() === 'extra').length;
      return `<div class="modal-card">
      <div class="mc-label">${cap(mes)}</div>
      <div class="mc-val">${rm.length}</div>
      <div class="mc-sub">${extras > 0 ? extras + ' extra' + (extras > 1 ? 's' : '') : ''}${extras > 0 && ops > 0 ? ' · ' : ''}${ops > 0 ? ops + ' op' + (ops > 1 ? 's' : '') : ''}</div>
      <div class="mc-sub" style="margin-top:2px">${extrasP > 0 ? extrasP + ' pgto extra' : ''}${extrasP > 0 && diarias > 0 ? ' · ' : ''}${diarias > 0 ? diarias + ' diária' + (diarias > 1 ? 's' : '') : ''}</div>
    </div>`;
    })
    .join('');

  const maxM = Math.max(
    ...meses.map(
      (mes) =>
        regs.filter((r) => (r['MÊS'] || '').toLowerCase() === mes.toLowerCase()).length,
    ),
    1,
  );
  const chartHtml = meses.length
    ? meses
        .map((mes) => {
          const cnt = regs.filter(
            (r) => (r['MÊS'] || '').toLowerCase() === mes.toLowerCase(),
          ).length;
          return `<div class="modal-bar-col">
      <span class="modal-bar-val">${cnt}</span>
      <div class="modal-bar" style="height:${Math.max(3, (cnt / maxM) * 80)}px"></div>
      <span class="modal-bar-label">${cap(mes).slice(0, 3)}</span>
    </div>`;
        })
        .join('')
    : '';

  const svcMap = {};
  regsFiltered.forEach((r) => {
    const k = r['SERVIÇO'] || '?';
    if (!svcMap[k]) svcMap[k] = { tipo: r['TIPO'] || '', pagamentos: {}, count: 0 };
    svcMap[k].count++;
    const pg = r['PAGAMENTO'] || '?';
    svcMap[k].pagamentos[pg] = (svcMap[k].pagamentos[pg] || 0) + 1;
  });

  const svcHtml = Object.entries(svcMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([nome, v]) => {
      const tipo = (v.tipo || '').toUpperCase();
      const tipoBadge =
        tipo === 'OPERAÇÃO'
          ? `<span class="badge badge-operacao">OPERAÇÃO</span>`
          : `<span class="badge badge-extra">EXTRA</span>`;
      const pgBadges = Object.entries(v.pagamentos)
        .map(
          ([pg, n]) =>
            `<span class="badge ${pg === 'Extra' ? 'badge-extra' : 'badge-diaria'}">${pg} ×${n}</span>`,
        )
        .join(' ');
      return `<div class="svc-item">
        <span class="svc-name">${nome}</span>
        <div class="svc-meta">
          <span class="svc-count">${v.count}×</span>
          ${tipoBadge}
          ${pgBadges}
        </div>
      </div>`;
    })
    .join('');

  const ordEsc = ord.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const mesOpts = [
    '<option value="">Todos os meses</option>',
    ...meses.map(
      (m) =>
        `<option value="${m}" ${mesFiltro === m ? 'selected' : ''}>${cap(m)}</option>`,
    ),
  ].join('');

  const regsHtml =
    regsFiltered.length > 0
      ? `
    <div class="modal-regs">
      <table>
        <thead><tr>
          <th>Data</th><th>Serviço</th><th>Tipo</th><th>Pagamento</th><th>Obs</th>
        </tr></thead>
        <tbody>
          ${regsFiltered
            .map(
              (r) =>
                `<tr>
            <td style="color:var(--muted)">${formatData(r['DATA'])}</td>
            <td>${r['SERVIÇO'] || ''}</td>
            <td>${(r['TIPO'] || '').toUpperCase() === 'OPERAÇÃO' ? '<span class="badge badge-operacao">OPERAÇÃO</span>' : '<span class="badge badge-extra">EXTRA</span>'}</td>
            <td><span class="badge ${r['PAGAMENTO'] === 'Extra' ? 'badge-extra' : 'badge-diaria'}">${r['PAGAMENTO'] || ''}</span></td>
            <td style="color:var(--muted)">${r['OBS'] || '—'}</td>
          </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`
      : `<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">Nenhum registro neste mês.</div>`;

  document.getElementById('modal-body').innerHTML = `
    <div>
      <div class="modal-section-title">Resumo por Mês</div>
      <div class="modal-cards">${mesCards}</div>
    </div>
    ${meses.length > 1 ? `<div>
      <div class="modal-section-title">Participações por Mês</div>
      <div class="modal-chart">${chartHtml}</div>
    </div>` : ''}
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <div class="modal-section-title" style="margin-bottom:0">Resumo por Serviço</div>
        <div class="modal-filter">
          <label>Filtrar mês:</label>
          <select onchange="renderModalBody('${ordEsc}', this.value)">${mesOpts}</select>
        </div>
      </div>
      <div class="svc-list">${svcHtml || '<div style="color:var(--muted);font-size:13px">Nenhum registro.</div>'}</div>
    </div>
    <div>
      <div class="modal-section-title">Registros ${mesFiltro ? '— ' + cap(mesFiltro) : ''}</div>
      ${regsHtml}
    </div>`;
}
