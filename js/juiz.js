// O juiz: a mesma pergunta com outra representacao e sem nenhuma reducao.
//
// O tabuleiro e uma matriz de letras: 'B' amazona branca, 'P' amazona preta,
// '#' flecha, '.' vazio. A cor de quem joga e explicita, sem trocar papeis. A
// memoria usa o texto do tabuleiro mais a cor como chave. Nao ha simetria, nao
// ha ordenacao e nao ha atalho para "tem lance": o juiz gera tudo e olha se a
// lista ficou vazia. Nada aqui vem do nucleo nem da busca.

const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

function raio (tab, r, c) {
  const saida = []
  for (const [dr, dc] of DIRS) {
    let i = r + dr
    let k = c + dc
    while (i >= 0 && i < tab.length && k >= 0 && k < tab[0].length && tab[i][k] === '.') {
      saida.push([i, k])
      i += dr
      k += dc
    }
  }
  return saida
}

function todosOsLances (tab, cor) {
  const saida = []
  for (let r = 0; r < tab.length; r++) {
    for (let c = 0; c < tab[0].length; c++) {
      if (tab[r][c] !== cor) continue
      for (const [r2, c2] of raio(tab, r, c)) {
        const t2 = tab.map((l) => l.slice())
        t2[r][c] = '.'
        t2[r2][c2] = cor
        for (const [r3, c3] of raio(t2, r2, c2)) {
          const t3 = t2.map((l) => l.slice())
          t3[r3][c3] = '#'
          saida.push(t3)
        }
      }
    }
  }
  return saida
}

export class Juiz {
  constructor () {
    this.memo = new Map()
  }

  ganha (tab, cor) {
    const k = cor + tab.map((l) => l.join('')).join('/')
    if (this.memo.has(k)) return this.memo.get(k)
    const outra = cor === 'B' ? 'P' : 'B'
    let r = false
    for (const t of todosOsLances(tab, cor)) {
      if (!this.ganha(t, outra)) { r = true; break }
    }
    this.memo.set(k, r)
    return r
  }
}

export function tabuleiro (largura, altura, brancas, pretas) {
  const tab = []
  for (let r = 0; r < altura; r++) tab.push(Array.from({ length: largura }, () => '.'))
  for (const b of brancas) tab[Math.floor(b / largura)][b % largura] = 'B'
  for (const p of pretas) tab[Math.floor(p / largura)][p % largura] = 'P'
  return tab
}
