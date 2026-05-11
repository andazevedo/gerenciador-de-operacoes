# Documentação do projeto — Gerenciador de operações

Aplicação **front-end estática**: HTML + CSS + JavaScript (**ES modules**), sem bundler. Os dados vêm do **Google Sheets** (CSV publicado) e escritas opcionais passam pelo **Google Apps Script** (`URL_SCRIPT`).

## Como executar

Os módulos ES (`type="module"`) em muitos navegadores **não funcionam** ao abrir `index.html` via `file://`. Suba um servidor HTTP na raiz do repositório:

```bash
npx serve .
```

Depois acesse o endereço indicado no terminal (ex.: `http://localhost:3000`).

É necessário conexão com a internet para: fontes Google, Papa Parse no CDN e as URLs da planilha / Apps Script.

## Organização (padrão MVC leve)

| Camada | Pasta / arquivo | Função |
|--------|-----------------|--------|
| **View (apresentação)** | `css/app.css` | Estilos globais da interface. |
| | `index.html` | Estrutura da página e IDs usados pelo JS (tabelas, modais, filtros). |
| | `js/views/*.js` | Funções que **só atualizam o DOM** (`renderDashboard`, `renderTable`, modais de detalhe, ranking etc.). |
| **Model (regra + dados em memória)** | `js/state/store.js` | Objeto único com listas (`allData`, `filtered`), paginação, ordenação do ranking e estado dos modais. |
| | `js/model/filters.js` | Montagem dos selects de filtro e aplicação dos filtros sobre `store.allData` → `store.filtered`. |
| **Services (IO)** | `js/services/loadSheets.js` | Carrega três CSVs públicos via **Papa Parse** e preenche o store. |
| | `js/services/appsScriptApi.js` | `fetch` POST para o web app do Apps Script (nova escala, militar, operação). |
| **Config** | `js/config.js` | URLs das abas, `URL_SCRIPT`, `PER_PAGE`, nomes das colunas da tabela principal. |
| **Utils** | `js/utils/text.js` | Formatação, ordenação de mês, remoção de BOM nos cabeçalhos CSV, status na barra superior. |
| **Controller** | `js/controllers/formsController.js` | Abre/fecha modais de cadastro e envia payloads para `appsScriptApi`. |
| **Entrada** | `js/main.js` | Importa módulos e expõe no `window` as funções usadas nos atributos `onclick` / `onchange` do HTML. |

Fluxo típico: **`loadSheets.loadAll`** → preenche o store → **`filters.buildFilters` + `applyFilters`** → as **views** redesenham dashboard, gráficos, ranking e tabela.

## Árvore de pastas relevante

```
├── index.html
├── css/
│   └── app.css
├── js/
│   ├── main.js                 ← entrada da aplicação
│   ├── config.js
│   ├── controllers/
│   │   └── formsController.js  ← formulários e modais de cadastro
│   ├── model/
│   │   └── filters.js
│   ├── services/
│   │   ├── loadSheets.js       ← Papa Parse → store
│   │   └── appsScriptApi.js     ← POST → Google Apps Script
│   ├── state/
│   │   └── store.js
│   ├── utils/
│   │   └── text.js
│   └── views/
│       ├── dashboardView.js
│       ├── chartView.js
│       ├── highlightsView.js
│       ├── tableView.js
│       ├── rankingView.js
│       └── modalDetailView.js   ← detalhe do militar (ranking / clique na linha)
└── docs/
    └── README.md                ← este arquivo
```

## Integração externa

- **Leitura:** três URLs CSV (aba Registro, Militares, Operações) definidas em `js/config.js`. Cabeçalhos são normalizados (BOM e espaços) em `normalizeHeader` dentro de `js/utils/text.js`.
- **Escrita:** o script publicado (`URL_SCRIPT` em `config.js`) recebe JSON com `action` (`nova_escala`, `novo_militar`, `nova_operacao`). Após sucesso, `appsScriptApi` agenda um novo **`loadAll`** para atualizar a tela.

## Manutenção rápida

- **Nova coluna na tabela principal:** ajustar `TABLE_COLS` em `js/config.js` e garantir que a planilha exporte o mesmo nome de coluna na primeira linha.
- **Mudança de aba/planilha:** atualizar as constantes `URL_REGISTRO`, `URL_MILITARES`, `URL_OPERACOES` em `js/config.js` (GID / link “Publicar na web”).
- **Handlers globais:** funções chamadas pelo HTML ficam registradas em `js/main.js` via `Object.assign(window, …)`.
