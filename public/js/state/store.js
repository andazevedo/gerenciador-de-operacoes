/**
 * Estado mutável central (substitui variáveis soltas).
 * Views e controllers importam este objeto — não há framework reativo.
 */
export const store = {
  allData: [],
  allMilitares: [],
  allOperacoes: [],
  filtered: [],
  currentPage: 1,
  sortCol: 'DATA',
  sortDir: 'asc',
  escalaMilitares: [],
  rankSortCol: 'antiguidade',
  rankSortDir: 'asc',
  rankingOpen: true,
  modalOrd: null,
};
