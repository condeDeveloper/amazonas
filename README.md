# Amazonas

O jogo das Amazonas com uma amazona de cada lado, resolvido em todos os inícios de 14 tabuleiros pequenos, e o 5×5 das quinas opostas. JavaScript puro, sem dependência nenhuma.

A amazona anda como a dama do xadrez: em linha reta, nas 8 direções, quantas casas quiser, sem pular nada. Depois atira uma flecha, também como dama, da casa onde parou. A casa da flecha fica bloqueada para sempre. Quem fica sem lance perde. Não há captura e todo lance bloqueia uma casa: a partida sempre acaba, e nunca empata.

**Página jogável:** <https://condedeveloper.github.io/amazonas/>

---

## Os quatro achados

**1. Nas faixas de três colunas, o comprimento ímpar é de quem começa, até quebrar no 7.** No 3×3 e no 3×5, quem começa ganha de **todos** os inícios: 72 de 72 e 210 de 210. Nas pares não: no 3×4 perde em 40 dos 132, no 3×6 em 144 dos 306. O 3×7 quase segue o padrão e quebra em **4 dos 420** inícios: a amazona de quem começa no meio da borda curta, e a outra uma ou duas casas à frente dela, na mesma coluna (duas posições e os espelhos delas).

**2. No 2×2 quem começa perde sempre; no 2×4, exatamente na metade dos inícios.** No 2×2 são 12 inícios e nenhum é de quem começa. No 2×4 são 56, e quem começa ganha 28. No 2×3 só dois inícios perdem, as duas amazonas lado a lado na linha do meio.

**3. O 5×5 das quinas opostas é de quem começa.** É o maior caso medido: **11.401.184** posições guardadas, perto do teto de 2²⁴ entradas do `Map` do JavaScript, em cerca de cinco minutos. Por isso ele roda uma vez só no CI, num job próprio.

**4. As duas reduções juntas rendem mais que o produto das duas.** Juntar posições simétricas e tentar primeiro os lances que deixam o outro com menos opções cortam o trabalho cada uma por conta própria. Medidas nas quatro combinações, as duas juntas rendem **40,30×** no 4×4, contra 36,41× do produto das separadas (5,94 × 6,13). No 3×4, 12,40× contra 9,36×; no 3×5, 19,72× contra 17,62×.

---

## As tabelas

Todos os números saem de `node ferramentas/medidor.js` e estão presos em `testes/`.

### Uma amazona de cada lado, todos os inícios

Um início é um par ordenado de casas distintas: a amazona de quem começa numa, a outra na outra.

| tabuleiro | inícios | quem começa ganha | perde | posições guardadas |
| --- | --- | --- | --- | --- |
| 2×2 | 12 | 0 | 12 | 5 |
| 2×3 | 30 | 28 | 2 | 24 |
| 2×4 | 56 | 28 | 28 | 104 |
| 2×5 | 90 | 80 | 10 | 326 |
| 2×6 | 132 | 104 | 28 | 1.643 |
| 2×7 | 182 | 144 | 38 | 3.933 |
| 2×8 | 240 | 192 | 48 | 16.500 |
| 3×3 | 72 | **72** | 0 | 242 |
| 3×4 | 132 | 92 | 40 | 5.446 |
| 3×5 | 210 | **210** | 0 | 41.150 |
| 3×6 | 306 | 162 | 144 | 335.637 |
| 3×7 | 420 | 416 | **4** | 1.718.686 |
| 4×4 | 240 | 180 | 60 | 56.758 |
| 4×5 | 380 | 220 | 160 | 2.113.638 |

O 3×7 e o 4×5 levam cerca de um minuto cada e ficam em `testes/pesados.test.js`. Acima disso só foi medido o 5×5 das quinas opostas.

### O tamanho do primeiro lance

Num tabuleiro vazio com uma amazona de cada lado, o primeiro lance tem de 16 a 37 opções no 3×3, de 44 a 98 no 4×4 e de 30 a 109 no 3×6, conforme onde as duas estão.

### A tabela cruzada

Posições abertas varrendo todos os inícios do tabuleiro:

| tabuleiro | nenhuma | só simetria | só ordenação | as duas | produto das separadas |
| --- | --- | --- | --- | --- | --- |
| 3×4 | 67.540 | 23.474 (2,88×) | 20.766 (3,25×) | 5.446 (12,40×) | 9,36× |
| 3×5 | 811.571 | 287.333 (2,82×) | 130.077 (6,24×) | 41.150 (19,72×) | 17,62× |
| 4×4 | 2.287.349 | 384.860 (5,94×) | 373.329 (6,13×) | 56.758 (40,30×) | 36,41× |

A simetria rende mais no 4×4 porque o quadrado tem 8 imagens e o retângulo só 4.

---

## O juiz

`js/juiz.js` não importa nada da busca nem do núcleo. O tabuleiro é uma matriz de letras, a cor de quem joga é explícita, a chave da memória é o texto do tabuleiro, e não há simetria, ordenação nem atalho para "tem lance".

| tabuleiro | inícios | divergências | controle: escura começando | posições do juiz |
| --- | --- | --- | --- | --- |
| 2×2 a 2×6 | 12 a 132 | 0 | 0, 0, 32, 16, 48 | até 110.374 |
| 3×3 | 72 | 0 | 0 | 7.502 |
| 3×4 | 132 | 0 | 52 | 147.404 |
| 4×4 | 240 | 0 | 96 | 4.820.496 |

O controle pergunta ao juiz quem ganha quando a amazona **escura** começa, e compara com a busca em que a clara começa. Onde os dois diferem, o juiz está medindo uma pergunta diferente, como deve. No 2×2, no 2×3 e no 3×3 o controle não separa nada, porque ali a resposta não depende de quem começa; nos outros, separa.

No 4×4 o juiz guarda 85 vezes mais posições que a busca, e é onde ele para.

---

## O que as medidas me corrigiram

**Somei de cabeça os raios do 3×3, e errei.** No teste das regras escrevi que os raios das nove casas somavam 52, contando 5 casas alcançáveis do meio de cada borda. São 6: uma para cada lado, duas para a frente, uma em cada diagonal. O total é 56, e o próprio teste acusou. Agora o teste escreve a conta (4 × 6 + 4 × 6 + 8) em vez do resultado.

O resto das tabelas não contrariou nenhuma aposta minha, porque não apostei por escrito antes de medir.

---

## Como rodar

Node 20 ou mais novo. Sem dependência.

```bash
npm test                                # leves e pesados (minutos)
npm run medir                           # as tabelas leves
node ferramentas/medidor.js pesados     # 3x7 e 4x5
node --max-old-space-size=4096 --test testes/quinas5.test.js   # o 5x5
```

## Os arquivos

- `js/nucleo.js`: as regras, os raios de cada casa, as simetrias.
- `js/busca.js`: a busca com memória, simetria e ordenação opcionais.
- `js/juiz.js`: a busca sem nenhuma redução, sem compartilhar código com a outra.
- `js/medidas.js`: as tabelas do README.
- `js/app.js`: a página jogável.
- `ferramentas/medidor.js`: imprime as tabelas.
- `testes/`: 30 testes, com os números do README presos.

## Licença

MIT.
