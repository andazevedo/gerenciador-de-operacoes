const { useState, useMemo } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PER_PAGE = 20;

const MES_ORDER = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

// Dados de demonstração — substituídos ao conectar o Google Sheets
const DEMO_DATA = [
  { DATA: "2026-01-04", "Nº MILITAR": 20, MILITAR: "2º SGT QBM_COMB WANZELER",   SERVIÇO: "DOMINGUEIRAS",           PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-04", "Nº MILITAR": 29, MILITAR: "2º SGT QBM_COMB GELMAX",     SERVIÇO: "DOMINGUEIRAS",           PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-04", "Nº MILITAR": 34, MILITAR: "3º SGT QBM_COMB REGIANE",    SERVIÇO: "DOMINGUEIRAS",           PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 7,  MILITAR: "1º SGT QBM_COMB NOVAIS",     SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 10, MILITAR: "1º SGT QBM_COMB FIRMINO",    SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 17, MILITAR: "2º SGT QBM_COMB LISBOA",     SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 18, MILITAR: "2º SGT QBM_COMB PIRES",      SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 21, MILITAR: "2º SGT QBM_COMB RENATO",     SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "",               MÊS: "janeiro"   },
  { DATA: "2026-01-10", "Nº MILITAR": 37, MILITAR: "CB QBM_COMB SERRÃO",         SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "AVENIDA",        MÊS: "janeiro"   },
  { DATA: "2026-01-11", "Nº MILITAR": 8,  MILITAR: "1º SGT QBM_COV PAIVA",       SERVIÇO: "PREVENÇÃO BALNEÁREA",    PAGAMENTO: "Extra",  OBS: "ALDEIA",         MÊS: "janeiro"   },
  { DATA: "2026-02-01", "Nº MILITAR": 20, MILITAR: "2º SGT QBM_COMB WANZELER",   SERVIÇO: "OP CARNAVAL",            PAGAMENTO: "Extra",  OBS: "AVENIDA",        MÊS: "fevereiro" },
  { DATA: "2026-02-01", "Nº MILITAR": 29, MILITAR: "2º SGT QBM_COMB GELMAX",     SERVIÇO: "OP CARNAVAL",            PAGAMENTO: "Extra",  OBS: "AVENIDA",        MÊS: "fevereiro" },
  { DATA: "2026-02-01", "Nº MILITAR": 34, MILITAR: "3º SGT QBM_COMB REGIANE",    SERVIÇO: "OP CARNAVAL",            PAGAMENTO: "Extra",  OBS: "TAPERA",         MÊS: "fevereiro" },
  { DATA: "2026-02-01", "Nº MILITANT": 37, MILITAR: "CB QBM_COMB SERRÃO",        SERVIÇO: "OP CARNAVAL",            PAGAMENTO: "Extra",  OBS: "TAPERA",         MÊS: "fevereiro" },
  { DATA: "2026-02-02", "Nº MILITAR": 8,  MILITAR: "1º SGT QBM_COV PAIVA",       SERVIÇO: "OP CARNAVAL",            PAGAMENTO: "Extra",  OBS: "ALDEIA",         MÊS: "fevereiro" },
  { DATA: "2026-02-15", "Nº MILITAR": 7,  MILITAR: "1º SGT QBM_COMB NOVAIS",     SERVIÇO: "JOGOS CAMETÁ",           PAGAMENTO: "Extra",  OBS: "CAMETÁ X REMO",  MÊS: "fevereiro" },
  { DATA: "2026-02-15", "Nº MILITAR": 10, MILITAR: "1º SGT QBM_COMB FIRMINO",    SERVIÇO: "JOGOS CAMETÁ",           PAGAMENTO: "Extra",  OBS: "CAMETÁ X REMO",  MÊS: "fevereiro" },
  { DATA: "2026-02-15", "Nº MILITAR": 17, MILITAR: "2º SGT QBM_COMB LISBOA",     SERVIÇO: "JOGOS CAMETÁ",           PAGAMENTO: "Diária", OBS: "CAMETÁ X PAYSANDU", MÊS: "fevereiro" },
  { DATA: "2026-03-05", "Nº MILITAR": 21, MILITAR: "2º SGT QBM_COMB RENATO",     SERVIÇO: "ABERTURA DA PESCA",      PAGAMENTO: "Extra",  OBS: "",               MÊS: "março"     },
  { DATA: "2026-03-05", "Nº MILITAR": 37, MILITAR: "CB QBM_COMB SERRÃO",         SERVIÇO: "ABERTURA DA PESCA",      PAGAMENTO: "Extra",  OBS: "",               MÊS: "março"     },
  { DATA: "2026-03-10", "Nº MILITAR": 8,  MILITAR: "1º SGT QBM_COV PAIVA",       SERVIÇO: "CONTEÇÃO DE PSIQUIÁTRICO", PAGAMENTO: "Extra", OBS: "",              MÊS: "março"     },
  { DATA: "2026-03-10", "Nº MILITAR": 20, MILITAR: "2º SGT QBM_COMB WANZELER",   SERVIÇO: "CONTEÇÃO DE PSIQUIÁTRICO", PAGAMENTO: "Extra", OBS: "",              MÊS: "março"     },
];

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sortByMes(arr) {
  return [...arr].sort((a, b) =>
    (MES_ORDER[a.toLowerCase()] || 99) - (MES_ORDER[b.toLowerCase()] || 99)
  );
}

function buildCsvUrl(raw) {
  const match = raw.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=REGISTRO`;
  }
  return raw; // já é uma URL de CSV
}

// ─── COMPONENTE: HEADER ───────────────────────────────────────────────────────

function Header() {
  return (
    <header>
      <div className="header-icon">🔥</div>
      <h1>CONTROLE DE OP. EXTRAS <span>/ 2026</span></h1>
      <div className="header-badge">CBMPA · CAMETÁ</div>
    </header>
  );
}

// ─── COMPONENTE: STATUS BAR ───────────────────────────────────────────────────

function StatusBar({ status, count, errorMsg }) {
  const dotClass = status === 'loading' ? 'loading' : status === 'error' ? 'error' : '';
  return (
    <div className="status-bar">
      <div className={`status-dot ${dotClass}`} />
      {status === 'demo'    && <span>Modo demonstração — conecte sua planilha abaixo</span>}
      {status === 'loading' && <span>Carregando dados do Google Sheets...</span>}
      {status === 'loaded'  && <span>{count} registros carregados do Google Sheets</span>}
      {status === 'error'   && <span style={{ color: 'var(--red)' }}>{errorMsg}</span>}
    </div>
  );
}

// ─── COMPONENTE: CONFIG BANNER ────────────────────────────────────────────────

function ConfigBanner({ onLoad }) {
  const [url, setUrl] = useState('');

  function handleLoad() {
    if (url.trim()) onLoad(url.trim());
  }

  return (
    <div className="config-banner">
      <h3>🔗 CONECTAR GOOGLE SHEETS</h3>
      <p>
        Cole o link da sua planilha no Google Drive.<br />
        A aba <strong>REGISTRO</strong> precisa estar <strong>publicada na web</strong>:
        {' '}<em>Arquivo → Compartilhar → Publicar na web → Aba REGISTRO → CSV → Publicar</em>
      </p>
      <div className="config-input-row">
        <input
          type="text"
          placeholder="https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLoad()}
        />
        <button className="btn-primary" onClick={handleLoad}>
          Carregar
        </button>
      </div>
      <div className="url-hint">
        💡 Cole o link normal da planilha — o sistema converte automaticamente para CSV
      </div>
    </div>
  );
}

// ─── COMPONENTE: GRÁFICO ──────────────────────────────────────────────────────

function Chart({ data, hasFilters }) {
  if (!data.length) return null;

  return (
    <div className="chart-wrapper">
      <div className="section-title">
        Participações por Mês {hasFilters && '(filtrado)'}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#8b949e', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#8b949e', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              color: '#e6edf3',
            }}
            cursor={{ fill: 'rgba(224,92,0,0.07)' }}
            formatter={v => [v, 'Participações']}
          />
          <Bar dataKey="total" fill="#e05c00" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── COMPONENTE: FILTROS ──────────────────────────────────────────────────────

function Filters({ options, filters, onChange, onClear }) {
  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="filters-wrapper">
      <div className="filters-label">⚙ Filtros</div>
      <div className="filters-grid">

        <div className="filter-group">
          <label>Militar</label>
          <select value={filters.militar} onChange={e => onChange('militar', e.target.value)}>
            <option value="">Todos</option>
            {options.militares.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Mês</label>
          <select value={filters.mes} onChange={e => onChange('mes', e.target.value)}>
            <option value="">Todos</option>
            {options.meses.map(m => <option key={m} value={m}>{capitalize(m)}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Operação / Serviço</label>
          <select value={filters.servico} onChange={e => onChange('servico', e.target.value)}>
            <option value="">Todos</option>
            {options.servicos.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Pagamento</label>
          <select value={filters.pagamento} onChange={e => onChange('pagamento', e.target.value)}>
            <option value="">Todos</option>
            {options.pagamentos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button className="btn-ghost" onClick={onClear}>
            ✕ Limpar filtros
          </button>
        )}

      </div>
    </div>
  );
}

// ─── COMPONENTE: TABELA ───────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'DATA',        label: 'Data'       },
  { key: 'Nº MILITAR',  label: 'Nº'         },
  { key: 'MILITAR',     label: 'Militar'    },
  { key: 'SERVIÇO',     label: 'Serviço'    },
  { key: 'PAGAMENTO',   label: 'Pagamento'  },
  { key: 'OBS',         label: 'Obs'        },
  { key: 'MÊS',         label: 'Mês'        },
];

function SortArrow({ col, sort }) {
  if (sort.col !== col) return <span className="sort-arrow">↕</span>;
  return <span className="sort-arrow">{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

function DataTable({ rows, total, sort, onSort, loading }) {
  const [page, setPage] = useState(1);

  // reset page when rows change
  useMemo(() => setPage(1), [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const pageData   = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function pageButtons() {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }

  return (
    <div className="table-wrapper">

      {/* Cabeçalho da tabela */}
      <div className="table-header">
        <div className="section-title">Registros de Operações</div>
        <div className="table-count">
          Exibindo <strong>{rows.length}</strong> de <strong>{total}</strong> registros
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="loading-row">
          <div className="spinner" />
          Carregando dados da planilha...
        </div>
      ) : rows.length === 0 ? (
        <div className="state-box">
          <div className="icon">🔍</div>
          <p>Nenhum registro encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className={sort.col === col.key ? 'sorted' : ''}
                      onClick={() => onSort(col.key)}
                    >
                      {col.label} <SortArrow col={col.key} sort={sort} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr key={i}>
                    <td className="muted">{String(row['DATA']).slice(0, 10)}</td>
                    <td className="muted">{row['Nº MILITAR']}</td>
                    <td><strong>{row['MILITAR']}</strong></td>
                    <td>{row['SERVIÇO']}</td>
                    <td>
                      <span className={`badge ${row['PAGAMENTO'] === 'Extra' ? 'badge-extra' : 'badge-diaria'}`}>
                        {row['PAGAMENTO']}
                      </span>
                    </td>
                    <td className="muted">{row['OBS'] || '—'}</td>
                    <td className="muted" style={{ fontStyle: 'italic' }}>{row['MÊS']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {pageButtons().map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} className="page-info">…</span>
                  : <button
                      key={p}
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
              )}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <span className="page-info">pág. {page} / {totalPages}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL: APP ────────────────────────────────────────────────

function App() {
  const [allData,  setAllData]  = useState(DEMO_DATA);
  const [status,   setStatus]   = useState('demo');   // demo | loading | loaded | error
  const [errorMsg, setErrorMsg] = useState('');
  const [filters,  setFilters]  = useState({ militar: '', mes: '', servico: '', pagamento: '' });
  const [sort,     setSort]     = useState({ col: 'DATA', dir: 'asc' });

  // ── Carregar do Google Sheets ──────────────────────────────────────────────
  function handleLoad(rawUrl) {
    setStatus('loading');
    setErrorMsg('');

    Papa.parse(buildCsvUrl(rawUrl), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete(result) {
        if (result.data?.length) {
          setAllData(result.data);
          setStatus('loaded');
          resetFilters();
        } else {
          setStatus('error');
          setErrorMsg('Nenhum dado encontrado. Verifique se a aba se chama REGISTRO e a planilha está publicada.');
        }
      },
      error() {
        setStatus('error');
        setErrorMsg('Erro ao carregar. Confirme se a planilha está publicada publicamente.');
      },
    });
  }

  // ── Filtros ────────────────────────────────────────────────────────────────
  function updateFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }));
  }

  function resetFilters() {
    setFilters({ militar: '', mes: '', servico: '', pagamento: '' });
  }

  // ── Opções únicas para os selects ─────────────────────────────────────────
  const options = useMemo(() => ({
    militares:  [...new Set(allData.map(r => r['MILITAR']))].filter(Boolean).sort(),
    meses:      sortByMes([...new Set(allData.map(r => r['MÊS']))].filter(Boolean)),
    servicos:   [...new Set(allData.map(r => r['SERVIÇO']))].filter(Boolean).sort(),
    pagamentos: [...new Set(allData.map(r => r['PAGAMENTO']))].filter(Boolean).sort(),
  }), [allData]);

  // ── Filtragem ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => allData.filter(r => {
    if (filters.militar   && r['MILITAR']   !== filters.militar)                    return false;
    if (filters.mes       && r['MÊS']?.toLowerCase() !== filters.mes.toLowerCase()) return false;
    if (filters.servico   && r['SERVIÇO']   !== filters.servico)                    return false;
    if (filters.pagamento && r['PAGAMENTO'] !== filters.pagamento)                  return false;
    return true;
  }), [allData, filters]);

  // ── Ordenação ──────────────────────────────────────────────────────────────
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    let va = a[sort.col] ?? '';
    let vb = b[sort.col] ?? '';
    if (sort.col === 'DATA')       { va = new Date(va); vb = new Date(vb); }
    else if (sort.col === 'Nº MILITAR') { va = Number(va); vb = Number(vb); }
    else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
    if (va < vb) return sort.dir === 'asc' ? -1 : 1;
    if (va > vb) return sort.dir === 'asc' ?  1 : -1;
    return 0;
  }), [filtered, sort]);

  function handleSort(col) {
    setSort(s => s.col === col
      ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: 'asc' }
    );
  }

  // ── Dados do gráfico ───────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const counts = {};
    filtered.forEach(r => {
      const m = r['MÊS'] || 'Sem mês';
      counts[m] = (counts[m] || 0) + 1;
    });
    return sortByMes(Object.keys(counts))
      .map(mes => ({ mes: capitalize(mes), total: counts[mes] }));
  }, [filtered]);

  const hasFilters = Object.values(filters).some(v => v);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main>
        <StatusBar status={status} count={allData.length} errorMsg={errorMsg} />
        <ConfigBanner onLoad={handleLoad} />
        <Chart data={chartData} hasFilters={hasFilters} />
        <Filters
          options={options}
          filters={filters}
          onChange={updateFilter}
          onClear={resetFilters}
        />
        <DataTable
          rows={sorted}
          total={allData.length}
          sort={sort}
          onSort={handleSort}
          loading={status === 'loading'}
        />
      </main>
    </>
  );
}

// ─── MOUNT ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
