import { URL_REGISTRO, URL_MILITARES, URL_OPERACOES } from '../config.js';
import { store } from '../state/store.js';
import { normalizeHeader, setStatus } from '../utils/text.js';
import { buildFilters, applyFilters } from '../model/filters.js';

/**
 * Serviço: carrega as 3 abas publicadas em CSV via Papa Parse.
 */
export function loadAll() {
  setStatus('loading', 'Carregando dados...');
  let done = 0;

  function check() {
    console.log(
      '⏳ check done=' +
        done +
        ' | allData:' +
        store.allData.length +
        ' | allMilitares:' +
        store.allMilitares.length +
        ' | allOperacoes:' +
        store.allOperacoes.length,
    );
    if (++done === 3) {
      console.log('✅ Todas as abas carregadas!');
      console.log('📌 Amostra MILITARES:', store.allMilitares.slice(0, 2));
      console.log('📌 Amostra REGISTRO:', store.allData.slice(0, 2));
      setStatus('ok', store.allData.length + ' registros carregados');
      buildFilters();
      applyFilters();
    }
  }

  Papa.parse(URL_REGISTRO, {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    complete(r) {
      store.allData = r.data || [];
      check();
    },
    error() {
      setStatus('error', 'Erro ao carregar registros.');
      check();
    },
  });
  Papa.parse(URL_MILITARES, {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    complete(r) {
      store.allMilitares = r.data || [];
      check();
    },
    error() {
      check();
    },
  });
  Papa.parse(URL_OPERACOES, {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    complete(r) {
      store.allOperacoes = r.data || [];
      check();
    },
    error() {
      check();
    },
  });
}
