// As regras do jogo das Amazonas em tabuleiros pequenos.
//
// Cada lado tem amazonas, que andam como a dama do xadrez: em linha reta, em
// qualquer das 8 direcoes, quantas casas quiser, sem pular nada. O lance tem
// duas partes: a amazona anda, e depois atira uma flecha da casa onde parou,
// tambem como dama. A casa da flecha fica bloqueada para sempre. Quem nao tem
// lance perde. Nao ha captura, e todo lance bloqueia uma casa: a partida
// sempre acaba, e nunca empata.
//
// A posicao e guardada do ponto de vista de quem esta na vez:
//   flechas: mascara das casas bloqueadas
//   eu:      lista das casas das minhas amazonas (ordenada)
//   outro:   lista das casas das amazonas dele (ordenada)

export function grade (largura, altura) {
  const casas = largura * altura
  if (casas > 30) throw new Error('acima de 30 casas a mascara nao cabe em 31 bits')
  // raios[c][d] = as casas em linha reta a partir de c na direcao d, em ordem.
  const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  const raios = []
  for (let c = 0; c < casas; c++) {
    const r0 = Math.floor(c / largura)
    const c0 = c % largura
    raios.push(dirs.map(([dr, dc]) => {
      const raio = []
      let r = r0 + dr
      let k = c0 + dc
      while (r >= 0 && r < altura && k >= 0 && k < largura) {
        raio.push(r * largura + k)
        r += dr
        k += dc
      }
      return raio
    }))
  }
  return { largura, altura, casas, raios }
}

// As casas alcancaveis de `de` em linha reta, parando antes do primeiro
// obstaculo. `ocupado` e uma mascara.
export function alcance (g, de, ocupado) {
  const saida = []
  for (const raio of g.raios[de]) {
    for (const c of raio) {
      if (ocupado & (1 << c)) break
      saida.push(c)
    }
  }
  return saida
}

export function ocupacao (pos) {
  let m = pos.flechas
  for (const a of pos.eu) m |= 1 << a
  for (const a of pos.outro) m |= 1 << a
  return m
}

// Todos os lances de quem esta na vez: { de, para, flecha }.
export function lances (g, pos) {
  const lista = []
  const ocupado = ocupacao(pos)
  for (const de of pos.eu) {
    const semEla = ocupado & ~(1 << de)
    for (const para of alcance(g, de, ocupado)) {
      const depois = semEla | (1 << para)
      for (const flecha of alcance(g, para, depois)) lista.push({ de, para, flecha })
    }
  }
  return lista
}

// Ha pelo menos um lance? Mais barato que gerar todos: basta uma amazona com
// uma casa vizinha livre (dali ela sempre pode atirar de volta na casa de onde
// saiu).
export function temLance (g, pos) {
  const ocupado = ocupacao(pos)
  for (const de of pos.eu) {
    for (const raio of g.raios[de]) if (raio.length && !(ocupado & (1 << raio[0]))) return true
  }
  return false
}

export function aplica (pos, j) {
  const eu = pos.eu.map((a) => a === j.de ? j.para : a).sort((a, b) => a - b)
  return { flechas: pos.flechas | (1 << j.flecha), eu: pos.outro, outro: eu }
}

// Chave numerica: flechas, depois as casas das amazonas em base `casas`.
export function chave (g, pos) {
  let k = pos.flechas
  for (const a of pos.eu) k = k * g.casas + a
  for (const a of pos.outro) k = k * g.casas + a
  return k
}

export function inicial (g, brancas, pretas) {
  return { flechas: 0, eu: [...brancas].sort((a, b) => a - b), outro: [...pretas].sort((a, b) => a - b) }
}

// As 8 simetrias do retangulo que cabem nele (4 se nao for quadrado), como
// permutacoes de casas.
export function simetrias (g) {
  const { largura: w, altura: h } = g
  const fs = [
    (r, c) => [r, c], (r, c) => [r, w - 1 - c], (r, c) => [h - 1 - r, c], (r, c) => [h - 1 - r, w - 1 - c]
  ]
  if (w === h) fs.push((r, c) => [c, r], (r, c) => [c, w - 1 - r], (r, c) => [w - 1 - c, r], (r, c) => [w - 1 - c, w - 1 - r])
  return fs.map((f) => {
    const p = []
    for (let i = 0; i < g.casas; i++) {
      const [r, c] = f(Math.floor(i / w), i % w)
      p.push(r * w + c)
    }
    return p
  })
}

export function permutaPos (perm, pos) {
  let f = 0
  for (let i = 0; i < perm.length; i++) if (pos.flechas & (1 << i)) f |= 1 << perm[i]
  return {
    flechas: f,
    eu: pos.eu.map((a) => perm[a]).sort((a, b) => a - b),
    outro: pos.outro.map((a) => perm[a]).sort((a, b) => a - b)
  }
}

export function desenha (g, pos, letraEu = 'B', letraOutro = 'P') {
  const linhas = []
  for (let r = 0; r < g.altura; r++) {
    let s = ''
    for (let c = 0; c < g.largura; c++) {
      const i = r * g.largura + c
      s += pos.eu.includes(i) ? letraEu : pos.outro.includes(i) ? letraOutro : pos.flechas & (1 << i) ? '#' : '.'
    }
    linhas.push(s)
  }
  return linhas.join('/')
}
