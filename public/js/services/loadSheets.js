import { URL_REGISTRO, URL_MILITARES, URL_OPERACOES, URL_PERM_AUT } from '../config.js';
import { store } from '../state/store.js';
import { normalizeHeader, setStatus } from '../utils/text.js';
import { buildFilters, applyFilters } from '../model/filters.js';

const SKIP_PERM_AUT_URL = URL_PERM_AUT.includes('SUBSTITUIR_GID_PERM_AUT');

export function loadAll() {
  setStatus('loading', 'Carregando dados...');
  let done = 0;

  function check() {
    console.log(
      '⏳ check done=' +
        done +
        ' | registro:' +
        store.allData.length +
        ' | mil:' +
        store.allMilitares.length +
        ' | op:' +
        store.allOperacoes.length +
        ' | permAut:' +
        store.allPermAut.length,
    );
    if (++done === 4) {
      console.log('✅ Abas carregadas (incl. PERM E AUT).');
      setStatus(
        'ok',
        store.allData.length + ' registros · ' + store.allPermAut.length + ' perm./aut.',
      );
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

  if (SKIP_PERM_AUT_URL) {
    console.warn(
      '[PERM E AUT] Defina o gid em config.js (URL_PERM_AUT). Aba ignorada até lá.',
    );
    store.allPermAut = [];
    check();
  } else {
    Papa.parse(URL_PERM_AUT, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete(r) {
        store.allPermAut = r.data || [];
        check();
      },
      error() {
        console.warn('Erro ao carregar PERM E AUT — verifique gid / publicação na web.');
        store.allPermAut = [];
        check();
      },
    });
  }
}
