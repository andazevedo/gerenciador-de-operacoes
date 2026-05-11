import { URL_REGISTRO, URL_MILITARES, URL_OPERACOES, URL_PERM_AUT } from '../config.js';
import { store } from '../state/store.js';
import { normalizeHeader, setStatus } from '../utils/text.js';
import { buildFilters, applyFilters } from '../model/filters.js';

const SKIP_PERM_AUT_URL = URL_PERM_AUT.includes('SUBSTITUIR_GID_PERM_AUT');

export function loadAll() {
  setStatus('loading', 'Carregando dados...');
  let done = 0;
  /** Papa Parse falhou no CSV público da aba (ex.: não republicada na web → redirect para login). */
  let permAutCsvFailed = false;

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
      const permLine =
        SKIP_PERM_AUT_URL
          ? '(PERM E AUT sem URL em config)'
          : `${store.allPermAut.length} perm./aut.`;
      let statusKind = 'ok';
      let statusMsg =
        store.allData.length + ' registros · ' + permLine;
      if (!SKIP_PERM_AUT_URL && permAutCsvFailed) {
        statusKind = 'warn';
        statusMsg +=
          ' · PERM E AUT: CSV inacessível. Em Planilhas: Ficheiro → Partilhar → Publicar na web — incluir o documento inteiro ou a aba PERM E AUT e republicar. Teste o link CSV numa aba anónima (não deve pedir login).';
      }
      setStatus(statusKind, statusMsg);
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
        console.log(
          '[PERM E AUT CSV]',
          'linhas:',
          store.allPermAut.length,
          'amostra:',
          store.allPermAut.slice(0, 2),
        );
        check();
      },
      error(err) {
        permAutCsvFailed = true;
        console.warn(
          'Erro ao carregar PERM E AUT (republicar na web / gid):',
          err || '',
        );
        store.allPermAut = [];
        check();
      },
    });
  }
}
