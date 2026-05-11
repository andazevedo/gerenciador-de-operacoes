/** Coluna do CSV pode vir como «N° MILITAR» ou variantes — localiza pela chave. */
export function paRowNumMil(r) {
  if (!r || typeof r !== 'object') return '';
  const direct =
    r['N° MILITAR'] ??
    r['Nº MILITAR'] ??
    r['N MILITAR'] ??
    '';
  if (direct !== undefined && direct !== null && String(direct).trim() !== '')
    return String(direct).trim();
  const k = Object.keys(r).find((key) => /N\s*[°º]?\s*MILITAR/i.test(key.trim()));
  return k ? String(r[k] ?? '').trim() : '';
}

export function paNomeMilitar(num, militares) {
  const ord = String(num ?? '').trim();
  if (!ord || !Array.isArray(militares)) return '';
  const m = militares.find((x) => String(x['ORD'] ?? '').trim() === ord);
  return (m?.['NOME'] || m?.['MILITAR'] || '').trim();
}

/** Chave estável militar + período para cota mensal */
export function paPeriodKey(row) {
  const n = paRowNumMil(row);
  const mes = String(row['MÊS'] ?? row['MES'] ?? '').trim().toLowerCase();
  const ano = String(row['ANO'] ?? '').trim();
  return `${n}|${mes}|${ano}`;
}
