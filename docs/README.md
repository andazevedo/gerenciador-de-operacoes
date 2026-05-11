# Documentação do projeto — Gerenciador de operações

Aplicação **front-end estática**: HTML + CSS + JavaScript (**ES modules**), sem bundler. Os dados vêm do **Google Sheets** (CSV publicado) e escritas opcionais passam pelo **Google Apps Script** (`URL_SCRIPT`).

## Como executar

Na raiz há um **`package.json` mínimo** (apenas scripts, sem dependências a instalar):

- **`npm start`** — sobe um servidor estático na pasta **`public`** (`serve public`).
- **`npm run build`** — não compila código; termina com sucesso para CI/Vercel. O site servido já está em **`public/`**.

Os módulos ES (`type="module"`) em muitos navegadores **não funcionam** ao abrir o HTML via `file://`. Use um servidor HTTP, por exemplo:

```bash
npm start
```

ou:

```bash
npx serve public
```

Depois acesse o endereço indicado no terminal (ex.: `http://localhost:3000`).

É necessário conexão com a internet para: fontes Google, Papa Parse no CDN e as URLs da planilha / Apps Script.

## Deploy na Vercel

O site publicável fica na pasta **`public/`**. O arquivo **`vercel.json`** define:

- **`outputDirectory`: `public`** — a Vercel usa essa pasta como raiz do deploy (corrige “No Output Directory named public”).
- **`buildCommand`: `npm run build`** — script rápido que só confirma sucesso.
- **`framework`: `null`** — sem detecção automática de framework.

O **Root Directory** do projeto na Vercel deve ser a **raiz do repositório** (onde está `vercel.json` e `package.json`). Se nos **Project Settings** ainda houver Output Directory diferente, defina **`public`** ou confie no `vercel.json`.

## Organização (padrão MVC leve)

| Camada | Pasta / arquivo | Função |
|--------|-----------------|--------|
| **View** | `public/css/app.css` | Estilos globais. |
| | `public/index.html` | Estrutura da página e IDs do DOM. |
| | `public/js/views/*.js` | Funções que **só atualizam o DOM**. |
| **Model** | `public/js/state/store.js` | Estado mutável (`allData`, `filtered`, etc.). |
| | `public/js/model/filters.js` | Filtros sobre `store.allData` → `store.filtered`. |
| **Services** | `public/js/services/loadSheets.js` | Papa Parse → store. |
| | `public/js/services/appsScriptApi.js` | POST para o Apps Script. |
| **Config** | `public/js/config.js` | URLs, `URL_SCRIPT`, colunas da tabela. |
| **Utils** | `public/js/utils/text.js` | Helpers e `setStatus`. |
| **Controller** | `public/js/controllers/formsController.js` | Modais de cadastro e envio. |
| **Entrada** | `public/js/main.js` | Módulos + `window` para `onclick`. |

Fluxo típico: **`loadSheets.loadAll`** → **`filters.buildFilters` + `applyFilters`** → **views**.

## Árvore de pastas relevante

```
├── public/
│   ├── index.html
│   ├── css/
│   │   └── app.css
│   └── js/
│       ├── main.js
│       ├── config.js
│       ├── controllers/
│       ├── model/
│       ├── services/
│       ├── state/
│       ├── utils/
│       └── views/
├── vercel.json
├── package.json
└── docs/
    └── README.md
```

## Integração externa

- **Leitura:** três URLs CSV em `public/js/config.js`; cabeçalhos CSV com `normalizeHeader` em `public/js/utils/text.js`.
- **Escrita:** `URL_SCRIPT` em `public/js/config.js`; payloads com `action` (`nova_escala`, `novo_militar`, `nova_operacao`).

## Manutenção rápida

- **Colunas da tabela:** `TABLE_COLS` em `public/js/config.js`.
- **URLs da planilha:** mesmas constantes em `public/js/config.js`.
- **Handlers globais:** `public/js/main.js`.
