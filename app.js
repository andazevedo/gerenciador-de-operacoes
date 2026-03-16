function Chart({ data, hasFilters }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.total));

  return (
    <div className="chart-wrapper">
      <div className="section-title">
        Participações por Mês {hasFilters && '(filtrado)'}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '160px', padding: '8px 0' }}>
        {data.map(({ mes, total }) => (
          <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{total}</span>
            <div style={{
              width: '100%',
              height: `${(total / max) * 120}px`,
              background: 'var(--accent)',
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s ease'
            }} />
            <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{mes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
