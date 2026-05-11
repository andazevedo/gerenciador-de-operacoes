/**
 * Ponto de entrada: expõe funções usadas em atributos onclick/onchange do HTML.
 * Padrão MVC leve: model (estado + filtros + serviços), views (render*), controllers (forms).
 */
import { loadAll } from './services/loadSheets.js';
import {
  applyFilters,
  buildFilters,
  resetFilters,
  resetFiltersRebuildAndApply,
} from './model/filters.js';
import { setSort, goPage } from './views/tableView.js';
import { toggleRanking, setRankSort } from './views/rankingView.js';
import { openModal, closeModal, closeModalBtn, renderModalBody } from './views/modalDetailView.js';
import * as forms from './controllers/formsController.js';

Object.assign(window, {
  loadAll,
  applyFilters,
  buildFilters,
  resetFilters,
  resetFiltersRebuildAndApply,
  setSort,
  goPage,
  toggleRanking,
  setRankSort,
  openModal,
  closeModal,
  closeModalBtn,
  renderModalBody,
  openEscalaModal: forms.openEscalaModal,
  closeEscalaModal: forms.closeEscalaModal,
  addMilitarEscala: forms.addMilitarEscala,
  removeMilitarEscala: forms.removeMilitarEscala,
  enviarEscala: forms.enviarEscala,
  openMilitarModal: forms.openMilitarModal,
  closeMilitarModal: forms.closeMilitarModal,
  salvarMilitar: forms.salvarMilitar,
  openOperacaoModal: forms.openOperacaoModal,
  closeOperacaoModal: forms.closeOperacaoModal,
  salvarOperacao: forms.salvarOperacao,
});

loadAll();
