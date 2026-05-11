/** Constantes da aplicação (URLs da planilha, colunas, paginação). */
export const PER_PAGE = 20;

export const MES_ORDER = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

export const URL_REGISTRO =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx5PjTtvdDEpIIVvOdiQJt_5-KbXYfdhtFRa4pJV_fJBUWFx9fngGXZT7qBw_6g9uj6Z3VpklX3Tnu/pub?gid=437673601&single=true&output=csv';
export const URL_OPERACOES =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx5PjTtvdDEpIIVvOdiQJt_5-KbXYfdhtFRa4pJV_fJBUWFx9fngGXZT7qBw_6g9uj6Z3VpklX3Tnu/pub?gid=2142908276&single=true&output=csv';
export const URL_MILITARES =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx5PjTtvdDEpIIVvOdiQJt_5-KbXYfdhtFRa4pJV_fJBUWFx9fngGXZT7qBw_6g9uj6Z3VpklX3Tnu/pub?gid=70108019&single=true&output=csv';

/** Aba «PERM E AUT» — troque SUBSTITUIR_GID pelo gid da aba (URL da planilha #gid=… ou publicar na web). */
export const URL_PERM_AUT =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx5PjTtvdDEpIIVvOdiQJt_5-KbXYfdhtFRa4pJV_fJBUWFx9fngGXZT7qBw_6g9uj6Z3VpklX3Tnu/pub?gid=SUBSTITUIR_GID_PERM_AUT&single=true&output=csv';

/** Trocas (permuta + autorização) por militar / mês antes de avisar cota. */
export const PERM_AUT_COTA_MENSAL = 2;

export const URL_SCRIPT =
  'https://script.google.com/macros/s/AKfycbwNRnXT4QjUBlLijDJUuyK2PKP-DSbpWy9H--mE7QqLlSHRVT8Y0xEHdUJ0_UJgorkDbA/exec';

export const TABLE_COLS = [
  { key: 'DATA', label: 'Data' },
  { key: 'Nº MILITAR', label: 'Nº' },
  { key: 'MILITAR', label: 'Militar' },
  { key: 'SERVIÇO', label: 'Serviço' },
  { key: 'TIPO', label: 'Tipo' },
  { key: 'PAGAMENTO', label: 'Pagamento' },
  { key: 'OBS', label: 'Obs' },
  { key: 'MÊS', label: 'Mês' },
];
