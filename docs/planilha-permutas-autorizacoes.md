# Aba «Permutas e Autorizações» na planilha

Esta página descreve **como criar a nova guia** na mesma planilha que o gerenciador já usa (Google Sheets).

## Escolha do formato da tabela

Há dois jeitos comuns:

### Opção A — Uma linha por militar por mês (combina com “permuta 1 / 2 e aut 1 / 2”)

Cada linha = um militar em um determinado **mês/ano**. As quatro colunas são os **dois registros de permuta** e os **dois de autorização** que você combinou como “slots” mensais.

| Função das colunas | Conteúdo sugerido |
|--------------------|-------------------|
| Identificação | `MÊS`, `ANO`, `Nº MILITAR`, `MILITAR` |
| Cotas flexíveis | `PERMUTA_1`, `PERMUTA_2`, `AUTORIZAÇÃO_1`, `AUTORIZAÇÃO_2` |

Em cada uma das quatro últimas colunas você pode registrar, por exemplo: **data** da troca, **sim**/**x**, ou texto curto.  
**Quantidade usada no mês** = quantas dessas **quatro células** estiverem preenchidas.

- **Limite combinado:** 2 trocas por militar por mês (pode ser 2 permutas, 2 autorizações ou 1+1).  
- **Ultrapassou:** soma > 2 → só **alerta** (não bloqueia); pode continuar preenchendo as células ou abrir novas linhas no mês seguinte.

**Se no futuro** um militar precisar de mais de quatro “slots” no mesmo mês, o mais simples é **adicionar colunas** `PERMUTA_3`, `AUTORIZAÇÃO_3`… ou passar para a **Opção B**.

### Opção B — Uma linha por evento (melhor para muitos registros e para o app)

Cada linha = **uma** permuta **ou** **uma** autorização.

Sugestão de colunas: `DATA`, `Nº MILITAR`, `MILITAR`, `MÊS`, `ANO`, `TIPO`, `DETALHE`, `OBS`  
— com `TIPO` = `PERMUTA` ou `AUTORIZAÇÃO`.

No mês, o total de trocas = **número de linhas** daquele militar naquele `MÊS`+`ANO`. Quando ≥ 2, mesma regra de alerta.

Para **começar** como você descreveu (4 caixas por mês), use a **Opção A**.

---

## Passo a passo no Google Sheets

1. Abra a planilha já publicada no link do projeto.
2. No rodapé, clique em **+** (nova guia) ou **Inserir → Planilha**.
3. Renomeie a guia para algo fixo, por exemplo: **`PERMUTAS E AUTORIZAÇÕES`** (evite acentos estranhos em nomes se for usar depois no Apps Script).
4. Na **linha 1**, cole os cabeçalhos da Opção A (abaixo).
5. Ajuste largura das colunas; opcional: **formatação condicional** na linha quando “trocas no mês” > 2 (fórmula na seção seguinte).
6. Para **puxar o nome** a partir da aba de militares: use `PROCV` / `XLOOKUP` pelo `Nº MILITAR` (igual à coluna `ORD` da aba **MILITARES**), se quiser preencher `MILITAR` automaticamente.

### Cabeçalhos Opção A (linha 1)

Copie uma linha só:

```text
MÊS	ANO	Nº MILITAR	MILITAR	PERMUTA_1	PERMUTA_2	AUTORIZAÇÃO_1	AUTORIZAÇÃO_2
```

(Ou use o ficheiro `docs/exemplos/permutas-cabecalhos-opcao-a.csv` deste repositório.)

### Cabeçalhos Opção B (linha 1)

```text
DATA	Nº MILITAR	MILITAR	MÊS	ANO	TIPO	DETALHE	OBS
```

---

## Fórmula de alerta (Opção A)

Supondo que a **primeira linha de dados** é a 2 e as colunas **E a H** são `PERMUTA_1` … `AUTORIZAÇÃO_2`:

Em uma coluna extra **I** com título `TROCAS_MÊS`, na célula `I2`:

```excel
=CONTARVALORES(E2;F2;G2;H2)
```

Em **J** com título `ALERTA_COTA`, em `J2`:

```excel
=SE(I2>2;"Ultrapassou 2 trocas no mês";"")
```

Arraste as fórmulas para baixo. Pode aplicar **formatação condicional** em toda a linha quando `I2>2`.

**Mês “reseta” sozinho:** cada linha deve ser de **um mês/ano** (`B` = ano, `A` = mês). Quando for fevereiro, nova linha com `MÊS=fevereiro` e `ANO=2026` → nova contagem.

---

## Relação com o site (próximos passos)

Hoje o app lê outras abas via **CSV publicado** (`gid` na URL). Depois de criar a guia:

1. **Publicar na web** / ajustar publicação para incluir a nova aba (ou novo `gid`).
2. No código, adicionar `URL_PERMUTAS` em `public/js/config.js` e lógica de dashboard/alertas na listagem.

Isso fica para o passo seguinte; o foco **agora** é só a estrutura da tabela na planilha.

---

## Resumo da regra de negócio (para não esquecer)

- Por **mês civil** e por **militar**: até **2 trocas** “contadas” entre permuta + autorização **no total**.
- Pode haver mais registros ou mais colunas preenchidas; a partir da **terceira** troca **contada** → **mostrar alerta**, sem bloquear cadastro.
